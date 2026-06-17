<?php
$user = ss();
if ($user->isAdmin != 1) back("관리자만 접근 할 수 있는 페이지입니다");
?>
<div class="relative-wrap">

    <section class="section page-schedule">
        <div class="wrap">
            <div class="control-link">
                <button class="btn dark course-change-btn">코스 변경</button>
                <button class="btn tour-set-btn" onclick="document.querySelector('.popup').style.display = 'flex'">투어일정등록</button>
            </div>
            <div class="course-list"></div>
            <div class="calendar-container">
                <div>
                    <div class="calendar-header">
                        <button class="prev-btn btn dark">이전 달</button>
                        <div class="title-content">
                            <div class="current-title"></div>
                            <div class="next-title"></div>
                        </div>
                        <button class="next-btn btn dark">다음 달</button>
                    </div>
                    <div class="calendar-content">
                        <div class="current-calendar"></div>
                        <div class="next-calendar"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <div class="popup">
        <form action="/tourAdd" method="post">
            <div class="popup-header">
                <h3>팝업 등록</h3>
                <button class="btn" onclick="document.querySelector('.popup').style.display = 'none'">닫기</button>
            </div>
            <input type="hidden" name="tour_course">
            <input type="hidden" name="start_date">
            <input type="hidden" name="end_date">
            <label>투어명: <input type="text" name="name" placeholder="투어명을 입력해주세요" required></label>
            <label>투어인원 상한: <input type="number" name="max_people" placeholder="투어인원 상한을 입력해주세요" required></label>
            <label>투어금액: <input type="number" name="price" placeholder="투어금액을 입력해주세요" required></label>
            <button class="btn dark">등록</button>
        </form>
    </div>
</div>


<script src="/js/schedule.js"></script>