<?php
$user = ss();
if ($user->isAdmin != 1) back("관리자만 접근 할 수 있는 페이지입니다");
?>
<div class="relative-wrap">

    <section class="section page-schedule">
        <div class="wrap">
            <div class="quick-link">
                <a href="/schedule" class="btn dark">투어 일정 설정</a>
                <a href="/course" class="btn">투어 코스 생성</a>
            </div>
            <button class="btn dark course-change-btn">코스 변경</button>
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

</div>

<script src="/js/schedule.js"></script>