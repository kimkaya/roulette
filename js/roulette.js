// 상품 데이터
let products = [];
let isSpinning = false;
let currentRotation = 0;

// 히든 버튼 관련
let devClickCount = 0;
let homeClickCount = 0;
const devBtn = document.getElementById('devBtn');
const homeBtn = document.getElementById('homeBtn');
const devButtons = document.getElementById('devButtons');

// 이펙트 상태
const effectState = {
    purple: false,
    gold: false,
    overheat: false
};

// Canvas 설정
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = canvas.width / 2;

// 룰렛 버튼 상태 업데이트
function updateSpinButtonState() {
    const spinBtn = document.getElementById('spinBtn');

    if (!products || products.length === 0) {
        spinBtn.disabled = true;
        spinBtn.textContent = '상품 없음';
        spinBtn.style.cursor = 'not-allowed';
        spinBtn.style.opacity = '0.5';
        return false;
    }

    // 재고가 있는 상품 확인
    const availableProducts = products.filter(p => p.quantity > 0);

    if (availableProducts.length === 0) {
        spinBtn.disabled = true;
        spinBtn.textContent = '재고 없음';
        spinBtn.style.cursor = 'not-allowed';
        spinBtn.style.opacity = '0.5';
        return false;
    }

    // 재고가 있으면 버튼 활성화
    spinBtn.disabled = false;
    spinBtn.textContent = '돌리기';
    spinBtn.style.cursor = 'pointer';
    spinBtn.style.opacity = '1';
    return true;
}

// 상품 데이터 로드
async function loadProducts() {
    try {
        const response = await fetch('api/get_products.php');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 응답 검증
        if (data.error) {
            throw new Error(data.error);
        }

        if (!Array.isArray(data)) {
            throw new Error('Invalid data format');
        }

        if (data.length === 0) {
            alert('등록된 상품이 없습니다. 관리자에게 문의하세요.');
            products = [];
            updateSpinButtonState();
            return;
        }

        products = data;
        drawRoulette();

        // 재고 상태에 따라 버튼 업데이트
        if (!updateSpinButtonState()) {
            alert('모든 상품의 재고가 소진되었습니다. 관리자에게 문의하세요.');
        }
    } catch (error) {
        console.error('상품 로드 실패:', error);
        alert('상품 데이터를 불러오는데 실패했습니다: ' + error.message);
        updateSpinButtonState();
    }
}

// 룰렛 그리기
function drawRoulette() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!products || products.length === 0) return;

    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

    // 총 수량이 0인 경우 방지
    if (totalQuantity === 0) {
        console.error('Total quantity is 0');
        return;
    }

    let currentAngle = currentRotation;

    products.forEach(product => {
        const sliceAngle = (product.quantity / totalQuantity) * Math.PI * 2;

        // 파이 조각 그리기
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = product.color;
        ctx.fill();

        // 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 텍스트
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(currentAngle + sliceAngle / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.fillText(product.name, radius * 0.6, 10);
        ctx.restore();

        currentAngle += sliceAngle;
    });

    // 중앙 원
    ctx.beginPath();
    ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.stroke();
}

// 랜덤 이펙트 선택 (일정 확률로)
function getRandomEffect() {
    const rand = Math.random();

    // 30% 확률로 이펙트 발동
    if (rand < 0.3) {
        const effects = ['purple', 'gold', 'overheat'];
        return effects[Math.floor(Math.random() * effects.length)];
    }

    return null;
}

// 당첨 상품 선택 (재고가 있는 상품만 선택)
function selectPrize() {
    if (!products || products.length === 0) {
        throw new Error('No products available');
    }

    // 재고가 있는 상품만 필터링
    const availableProducts = products.filter(p => p.quantity > 0);

    if (availableProducts.length === 0) {
        throw new Error('All products are out of stock');
    }

    const totalQuantity = availableProducts.reduce((sum, p) => sum + p.quantity, 0);

    if (totalQuantity === 0) {
        throw new Error('Total quantity is 0');
    }

    let random = Math.random() * totalQuantity;

    for (let product of availableProducts) {
        random -= product.quantity;
        if (random <= 0) {
            return product;
        }
    }

    return availableProducts[availableProducts.length - 1];
}

// 상품의 각도 계산
function getProductAngle(product) {
    if (!products || products.length === 0) {
        throw new Error('No products available');
    }

    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

    if (totalQuantity === 0) {
        throw new Error('Total quantity is 0');
    }

    let angle = 0;

    for (let p of products) {
        const sliceAngle = (p.quantity / totalQuantity) * 360;

        if (p.id === product.id) {
            // 해당 상품의 중간 지점 반환
            return angle + sliceAngle / 2;
        }

        angle += sliceAngle;
    }

    return 0;
}

// 룰렛 회전
function spinRoulette() {
    // 1차 체크: 이미 회전 중인지
    if (isSpinning) {
        console.warn('Already spinning');
        return;
    }

    // 2차 체크: 상품 데이터 확인
    if (!products || products.length === 0) {
        alert('등록된 상품이 없습니다. 룰렛을 돌릴 수 없습니다.');
        updateSpinButtonState();
        return;
    }

    // 3차 체크: 재고가 있는 상품이 있는지 확인
    const availableProducts = products.filter(p => p.quantity > 0);
    if (availableProducts.length === 0) {
        alert('모든 상품의 재고가 소진되었습니다. 룰렛을 돌릴 수 없습니다.');
        updateSpinButtonState();
        return;
    }

    // 4차 체크: 총 재고량 확인
    const totalQuantity = availableProducts.reduce((sum, p) => sum + p.quantity, 0);
    if (totalQuantity <= 0) {
        alert('사용 가능한 재고가 없습니다.');
        updateSpinButtonState();
        return;
    }

    // 모든 체크 통과 - 룰렛 실행
    isSpinning = true;
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;

    // 랜덤 이펙트 체크 (개발자 버튼으로 강제 활성화 가능)
    let effect = null;
    for (let key in effectState) {
        if (effectState[key]) {
            effect = key;
            effectState[key] = false; // 1회 사용 후 비활성화

            // 버튼 상태 업데이트
            const btn = document.querySelector(`[data-effect="${key}"]`);
            if (btn) {
                btn.classList.add('used');
            }

            break;
        }
    }

    if (!effect) {
        effect = getRandomEffect();
    }

    // 이펙트 적용
    const container = document.getElementById('rouletteContainer');
    const overlay = document.getElementById('effectOverlay');

    if (effect) {
        container.classList.add('spinning', effect);
        overlay.classList.add(effect);

        setTimeout(() => {
            overlay.classList.remove(effect);
        }, 2000);
    } else {
        container.classList.add('spinning');
    }

    // 당첨 상품 선택
    try {
        const prize = selectPrize();
        const targetAngle = getProductAngle(prize);

        // 회전 애니메이션 (5바퀴 + 목표 각도)
        const spins = 5;
        const totalRotation = (spins * 360) + (360 - targetAngle);
        const duration = 5000; // 5초
        const startTime = Date.now();
        const startRotation = currentRotation;

        async function animate() {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // easeOutCubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            currentRotation = startRotation + (totalRotation * easeProgress * Math.PI / 180);
            drawRoulette();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 회전 완료 - 재고 감소 시도
                try {
                    const response = await fetch('api/decrease_stock.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            productId: prize.id
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();

                    if (!result.success) {
                        throw new Error(result.error || 'Failed to decrease stock');
                    }

                    // 재고 감소 성공 - 결과 페이지로 이동
                    isSpinning = false;
                    spinBtn.disabled = false;
                    container.classList.remove('spinning', 'purple', 'gold', 'overheat');

                    sessionStorage.setItem('prize', JSON.stringify(prize));
                    location.href = 'result.php';

                } catch (error) {
                    console.error('재고 감소 실패:', error);

                    isSpinning = false;
                    container.classList.remove('spinning', 'purple', 'gold', 'overheat');

                    // 재고 부족 또는 오류 처리
                    if (error.message.includes('out of stock')) {
                        alert('죄송합니다. 해당 상품의 재고가 소진되었습니다. 다시 시도해주세요.');
                        // 상품 데이터 다시 로드하고 버튼 상태 업데이트
                        await loadProducts();
                    } else {
                        alert('오류가 발생했습니다: ' + error.message + '\n다시 시도해주세요.');
                        // 상품 데이터 다시 로드하고 버튼 상태 업데이트
                        await loadProducts();
                    }
                }
            }
        }

        requestAnimationFrame(animate);
    } catch (error) {
        console.error('Spin error:', error);
        alert('룰렛 회전 중 오류가 발생했습니다: ' + error.message);
        isSpinning = false;
        spinBtn.disabled = false;
        container.classList.remove('spinning', 'purple', 'gold', 'overheat');
    }
}

// 개발자 버튼 (왼쪽 상단)
devBtn.addEventListener('click', () => {
    devClickCount++;

    if (devClickCount === 5) {
        devButtons.classList.toggle('show');
        devClickCount = 0;
    }

    setTimeout(() => {
        if (devClickCount < 5) {
            devClickCount = 0;
        }
    }, 3000);
});

// 홈 버튼 (오른쪽 상단)
homeBtn.addEventListener('click', () => {
    homeClickCount++;

    if (homeClickCount === 5) {
        location.href = 'index.php';
    }

    setTimeout(() => {
        if (homeClickCount < 5) {
            homeClickCount = 0;
        }
    }, 3000);
});

// 이펙트 버튼들
document.querySelectorAll('.effect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('used')) return;

        const effect = btn.dataset.effect;
        effectState[effect] = true;

        alert(`${btn.textContent} 활성화! 다음 룰렛 돌리기에 적용됩니다.`);
    });
});

// 스핀 버튼
document.getElementById('spinBtn').addEventListener('click', spinRoulette);

// 초기화
loadProducts();
