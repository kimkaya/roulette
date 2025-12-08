// 당첨 상품 정보 가져오기
const prizeData = sessionStorage.getItem('prize');
let prize = null;

try {
    if (prizeData) {
        prize = JSON.parse(prizeData);

        // 데이터 검증
        if (!prize || !prize.name || !prize.color) {
            throw new Error('Invalid prize data');
        }

        document.getElementById('prizeName').textContent = prize.name;
        document.getElementById('prizeName').style.color = prize.color;
    } else {
        // 상품 정보가 없으면 룰렛 페이지로 이동
        throw new Error('No prize data');
    }
} catch (error) {
    console.error('Prize data error:', error);
    // 상품 정보가 없거나 잘못되었으면 룰렛 페이지로 이동
    location.href = 'roulette.php';
}

// 폭죽 효과 생성
function createConfetti() {
    const confetti = document.getElementById('confetti');
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff1493'];

    for (let i = 0; i < 100; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 3 + 's';
        piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.appendChild(piece);
    }
}

// 타이머 시작
let timeLeft = 5;
const timerElement = document.getElementById('timer');

const countdown = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
        clearInterval(countdown);
        location.href = 'roulette.php';
    }
}, 1000);

// 폭죽 생성
createConfetti();
