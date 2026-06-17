<?php
$user = ss();
if ($user->isAdmin != 1) back("관리자만 접근 할 수 있는 페이지입니다");
?>

<section class="section course-section page-course">
    <div class="wrap">
        <button class="btn dark schedule-btn">일정 설정</button>
        <div class="route-result">
            <p>출발지:
                <span class="start-place"></span>
            </p>
            <p>도착지:
                <span class="end-place"></span>
            </p>
            <button class="btn dark search-btn">검색</button>
        </div>
        <div class="canvas-map">
            <canvas width="1300" height="700" id="canvas"></canvas>
            <div class="control-modal">
                <button class="btn start-place-btn">출발지</button>
                <button class="btn end-place-btn">도착지</button>
            </div>
        </div>
        <div class="sort-btns">
            <button class="btn distance-sort-btn active">최단거리</button>
            <button class="btn transfer-sort-btn">최소환승</button>
        </div>
        <ul class="course-list"></ul>
    </div>
</section>

<script type="module" src="/js/course.js"></script>