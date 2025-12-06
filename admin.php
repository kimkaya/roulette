<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 페이지</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>상품 관리</h1>
            <button class="back-btn" onclick="location.href='index.php'">메인으로</button>
        </div>

        <div class="products-list" id="productsList">
            <!-- 상품 목록이 여기에 동적으로 생성됩니다 -->
        </div>

        <div class="actions">
            <button class="add-btn" id="addBtn">상품 추가</button>
            <button class="save-btn" id="saveBtn">저장</button>
        </div>

        <div class="total-info" id="totalInfo"></div>
    </div>

    <script src="js/admin.js"></script>
</body>
</html>
