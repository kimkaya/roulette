// 관리자 페이지로 가기 위한 히든 버튼
let adminClickCount = 0;
const adminBtn = document.getElementById('adminBtn');

adminBtn.addEventListener('click', () => {
    adminClickCount++;

    if (adminClickCount === 5) {
        location.href = 'admin.php';
    }

    // 3초 후 클릭 카운트 리셋
    setTimeout(() => {
        if (adminClickCount < 5) {
            adminClickCount = 0;
        }
    }, 3000);
});
