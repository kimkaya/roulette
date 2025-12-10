<?php
/**
 * 파일 잠금 헬퍼 함수
 * 동시성 제어를 위한 안전한 파일 읽기/쓰기 함수 제공
 */

/**
 * 파일을 안전하게 읽기 (공유 잠금 사용)
 *
 * @param string $filePath 읽을 파일 경로
 * @param int $timeout 잠금 대기 시간(초), 기본값 5초
 * @return string|false 파일 내용 또는 실패 시 false
 * @throws Exception 잠금 획득 실패 시
 */
function safeReadFile($filePath, $timeout = 5) {
    if (!file_exists($filePath)) {
        return false;
    }

    $fp = fopen($filePath, 'r');
    if ($fp === false) {
        throw new Exception('Failed to open file for reading');
    }

    $startTime = time();
    $locked = false;

    // 공유 잠금 시도 (LOCK_SH: 읽기 잠금, 여러 프로세스가 동시에 읽기 가능)
    while (!$locked && (time() - $startTime) < $timeout) {
        $locked = flock($fp, LOCK_SH | LOCK_NB);
        if (!$locked) {
            usleep(100000); // 100ms 대기 후 재시도
        }
    }

    if (!$locked) {
        fclose($fp);
        throw new Exception('Failed to acquire read lock within timeout');
    }

    // 파일 내용 읽기
    $content = stream_get_contents($fp);

    // 잠금 해제
    flock($fp, LOCK_UN);
    fclose($fp);

    return $content;
}

/**
 * 파일을 안전하게 쓰기 (배타적 잠금 사용)
 *
 * @param string $filePath 쓸 파일 경로
 * @param string $content 쓸 내용
 * @param int $timeout 잠금 대기 시간(초), 기본값 5초
 * @return bool 성공 여부
 * @throws Exception 잠금 획득 실패 시
 */
function safeWriteFile($filePath, $content, $timeout = 5) {
    // 디렉토리가 없으면 생성
    $dir = dirname($filePath);
    if (!is_dir($dir)) {
        if (!mkdir($dir, 0755, true)) {
            throw new Exception('Failed to create directory');
        }
    }

    // 파일이 없으면 생성
    if (!file_exists($filePath)) {
        touch($filePath);
        chmod($filePath, 0644);
    }

    $fp = fopen($filePath, 'c'); // 'c' 모드: 쓰기 전용, 파일이 없으면 생성
    if ($fp === false) {
        throw new Exception('Failed to open file for writing');
    }

    $startTime = time();
    $locked = false;

    // 배타적 잠금 시도 (LOCK_EX: 쓰기 잠금, 다른 모든 프로세스 차단)
    while (!$locked && (time() - $startTime) < $timeout) {
        $locked = flock($fp, LOCK_EX | LOCK_NB);
        if (!$locked) {
            usleep(100000); // 100ms 대기 후 재시도
        }
    }

    if (!$locked) {
        fclose($fp);
        throw new Exception('Failed to acquire write lock within timeout');
    }

    // 파일 내용 지우기
    ftruncate($fp, 0);
    rewind($fp);

    // 새 내용 쓰기
    $result = fwrite($fp, $content);

    // 디스크에 즉시 쓰기 (버퍼 플러시)
    fflush($fp);

    // 잠금 해제
    flock($fp, LOCK_UN);
    fclose($fp);

    return $result !== false;
}

/**
 * 파일을 읽고 수정하고 쓰는 원자적 작업 (트랜잭션)
 *
 * @param string $filePath 파일 경로
 * @param callable $callback 파일 내용을 수정하는 콜백 함수
 *                          function($content) { return $newContent; }
 * @param int $timeout 잠금 대기 시간(초), 기본값 5초
 * @return mixed 콜백 함수의 반환값
 * @throws Exception 잠금 획득 실패 시
 */
function atomicFileOperation($filePath, $callback, $timeout = 5) {
    // 디렉토리가 없으면 생성
    $dir = dirname($filePath);
    if (!is_dir($dir)) {
        if (!mkdir($dir, 0755, true)) {
            throw new Exception('Failed to create directory');
        }
    }

    // 파일이 없으면 생성
    if (!file_exists($filePath)) {
        touch($filePath);
        chmod($filePath, 0644);
    }

    $fp = fopen($filePath, 'c+'); // 'c+' 모드: 읽기/쓰기, 파일이 없으면 생성
    if ($fp === false) {
        throw new Exception('Failed to open file');
    }

    $startTime = time();
    $locked = false;

    // 배타적 잠금 시도
    while (!$locked && (time() - $startTime) < $timeout) {
        $locked = flock($fp, LOCK_EX | LOCK_NB);
        if (!$locked) {
            usleep(100000); // 100ms 대기 후 재시도
        }
    }

    if (!$locked) {
        fclose($fp);
        throw new Exception('Failed to acquire lock within timeout');
    }

    try {
        // 파일 내용 읽기
        $content = stream_get_contents($fp);

        // 콜백 함수로 내용 수정
        $result = $callback($content, $fp);

        // 결과가 문자열이면 파일에 쓰기
        if (is_string($result)) {
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, $result);
            fflush($fp);
        }

        return $result;

    } finally {
        // 잠금 해제 (예외 발생 시에도 실행)
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}
?>
