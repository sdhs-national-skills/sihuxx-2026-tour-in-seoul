<?php
$tours = db::fetchAll('select * from tours order by start_date desc');
$today = (new DateTime())->format("Y-m-d");
$user = ss();
?>

<section class="section pt">
  <div class="wrap">
    <p class="section-title">투어 예약</p>
    <div class="order-link">
      <button class="btn dark order-btn">종료된 투어 숨기기</button>
    </div>
    <ul class="tour-list">
      <?php foreach ($tours as $tour) { 
        $reserves = db::fetch("select COALESCE(SUM(people), 0) people from reserves where tour_idx = '$tour->idx'");
        ?>
        <li class="tour <?= $tour->end_date < $today ? "ended" : "" ?>">
          <span class="end-label"><?= $tour->end_date < $today ? "종료된 투어입니다" : "" ?></span>
          <p>투어명: <?= $tour->name ?></p>
          <p>투어코스: <?= $tour->course ?></p>
          <p>시작날짜: <?= $tour->start_date ?></p>
          <p>종료날짜: <?= $tour->end_date ?></p>
          <p>금액: <?= number_format($tour->price) ?>원</p>
          <?php if (!($tour->start_date < $today && $today < $tour->end_date || $tour->end_date < $today)) { ?>
            <button class="btn dark" <?= $tour->start_date < $today ? "disabled" : "" ?> onclick="document.querySelector('.popup').style.display = 'flex'">예약하기</button>
          <?php } ?>
        </li>

        <div class="popup">
          <div class="popup-header">
            <button class="btn" onclick="document.querySelector('.popup').style.display = 'none'">닫기</button>
          </div>
          <form action="/reserveAdd" method="post" class="tour-form">
            <div class="popup-content">
              <input type="number" min="1" max="<?= $tour->max_people - ($reserves->people ?? 0)?>" name="people" class="peopleInput" placeholder="인원 수">
              <input type="hidden" name="tour_idx" value="<?= $tour->idx ?>">
              <div class="popup-status">
                <p>남은 인원수: <span class="people-left" data-left="<?= $tour->max_people - ($reserves->people ?? 0) ?>"></span>명</p>
                <p>금액: <span class="price" data-price="<?= $tour->price ?>"></span>원</p>
              </div>
            </div>
            <button class="btn dark reserve-btn">예약하기</button>
          </form>
        </div>
      <?php } ?>
    </ul>
  </div>
</section>


<script>
  const orderBtn = $(".order-btn");
  const leftContent = $(".popup-status .people-left")
  const priceContent = $(".popup-status .price")
  const input = $(".peopleInput");
  let left = leftContent.dataset.left;
  let price = +priceContent.dataset.price;

  orderBtn.onclick = () => {
    document.body.classList.toggle("hide-body");
    orderBtn.textContent = document.body.classList.contains("hide-body") ? "종료된 투어 보이기" : "종료된 투어 숨기기"
  }

  function statusRender() {
    leftContent.textContent = left - input.value;
    priceContent.textContent = (price * input.value).toLocaleString();

    if (left - input.value == 0) {
      $(".reserve-btn").disabled = true;
      return;
    } else {
      $(".reserve-btn").disabled = false;
    }
  }

  input.onchange = () => {
    statusRender();
  }
  statusRender();
</script>