<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>룰렛 돌리기</title>
    <link rel="stylesheet" href="css/roulette.css">
</head>
<body>
    <div class="hidden-btn left" id="devBtn"></div>
    <div class="hidden-btn right" id="homeBtn"></div>

    <div class="dev-buttons" id="devButtons">
        <button class="effect-btn" data-effect="purple">확률 UP 이펙트</button>
        <button class="effect-btn" data-effect="gold">골드 이펙트</button>
        <button class="effect-btn" data-effect="overheat">과열 이펙트</button>
    </div>

    <div class="container">
        <div class="title">행운의 룰렛</div>

        <div class="roulette-container" id="rouletteContainer">
            <canvas id="rouletteCanvas" width="800" height="800"></canvas>
            <div class="pointer"></div>
            <button class="spin-btn" id="spinBtn">돌리기</button>
        </div>

        <div class="effect-overlay" id="effectOverlay"></div>
    </div>

    <script src="js/roulette.js"></script>
</body>
</html>
