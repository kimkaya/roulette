<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>당첨 결과</title>
    <link rel="stylesheet" href="css/result.css">
</head>
<body>
    <div class="container">
        <div class="confetti" id="confetti"></div>

        <div class="result-box">
            <div class="congrats">축하합니다!</div>
            <div class="prize-name" id="prizeName"></div>
            <div class="prize-icon">🎁</div>
            <div class="message">당첨되었습니다!</div>
        </div>

        <div class="timer">
            <span id="timer">5</span>초 후 룰렛 페이지로 돌아갑니다
        </div>
    </div>

    <script src="js/result.js"></script>
</body>
</html>
