const courseData = JSON.parse(localStorage.getItem("course"))
const courseList = $(".course-list")
const courseRoute = courseData.routeText.split("->")
const calendar = $(".calendar-content")
const startLocation = courseRoute[0]
const endLocation = courseRoute.at(-1)

// 상태
const state = {
  currentIdx: 0,
  schedule: []
}

// 코스 목록 랜더링 함수
function renderCourseList() {
  courseList.innerHTML = courseRoute.map((location, idx) => `<div data-location="${location}" class="course-route ${idx !== state.currentIdx ? 'disabled' : ''}" draggable="true">${location}</div>`).join('');
  // 드래그 앤 드롭 마다 currentIdx++ 해서 이미 접근한 idx는 접근하지 못하게 함
}

// 드래그 시작 시 해당 요소에 .dragging 클래스 붙임
document.body.addEventListener('dragstart', (e) => {
  // 이벤트 버블링
  if (e.target.classList.contains('course-route')) {
    e.target.classList.add("dragging")
  }
});

// 드래그 종료 시 해당 요소에 .drgging 클래스 지움
document.body.addEventListener('dragend', (e) => {
  if (e.target.classList.contains('course-route')) {
    e.target.classList.remove("dragging")
  }
});

// 이벤트 건 요소에 드롭을 허용한다는 의미
calendar.addEventListener("dragover", (e) => { e.preventDefault() })

// 드롭 이벤트
/* 
  - 얕은 복사 : 겉 껍데기만 새로 만들고, 안쪽 객체는 원본과 공유하는 복사
  - 깊은 복사 : 객체 안의 객체까지 전부 새로 만드는 복사
*/
calendar.addEventListener("drop", (e) => {
  e.preventDefault() // 브라우저의 기본 드롭 동작을 막기 위한 코드

  if (e.target.classList.contains("disabled")) return

  const draggingItem = $(".dragging")
  const droppedDay = e.target.closest(".day");
  const dayDraggingItem = $(".day-dragging")

  if (!droppedDay) return;

  const { dataset: { date } } = droppedDay; // 드롭한 영역 날짜 꺼냄
  /* 
    indexOf() : 값 자체를 비교 (===)
    findIndex() : 함수를 실행해 true인 조건을 비교
  */
  if (dayDraggingItem) {
    const targetText = dayDraggingItem.textContent.trim()
    const currentIdx = courseRoute.indexOf(targetText)
    if (currentIdx > 0) {
      const prevLocation = courseRoute[currentIdx - 1]
      const targetDate = new Date(date)
      const prevDate = new Date(state.schedule.find(item => item.location == prevLocation).date)
      if (targetDate < prevDate) {
        alert("이전 일정보다 앞선 날짜로 이동 할 수 없습니다")
        return
      }
    }
    const index = state.schedule.findIndex(item => item.location == targetText)
    if (index === -1) return
    state.schedule[index].date = date
    state.schedule.sort((a, b) => new Date(a.date) - new Date(b.date))
    renderAll()
    // const overDate = new Date(date)
    // // 찾은 날짜의 스케줄 개수가 4개보다 클 동안 1일 추가
    // while (state.schedule.filter(item => item.date == `${makeTimeStamp(overDate)}`).length >= 4) {
    //   overDate.setDate(overDate.getDate() + 1)
    // }
  }

  
  if (!draggingItem) return
  const { dataset: { location } } = draggingItem; // 드래그 중인 장소 이름 꺼냄
  // const location = draggingItem.dataset.location; 와 같다
  
  const previousScheduleDate = structuredClone(state.schedule).pop(); // 마지막 일정 가져옴
  if (!previousScheduleDate) { // 일정이 없으면
    scheduleRender(date, location)
    return
  }
  const prevDate = new Date(previousScheduleDate.date) // 마지막 일정 날짜
  const droppedDate = new Date(date); // 현재 드롭한 영역의 날짜
  
  const diffDays = Math.floor( // 밀리초 -> 일로 변환
    (droppedDate - prevDate) / (1000 * 60 * 60 * 24)
  );
  
  if (diffDays > 1) return alert('연속된 날짜가 아닙니다'); //(ex) 2026-08-03 - 2026-08-01 -> diffDays === 2

  if(courseRoute.indexOf(startLocation) == courseRoute.indexOf(draggingItem)) {
    // 시작 장소를 드래그 했을 떄 이벤트
  }

  const overDate = new Date(date)
  // 찾은 날짜의 스케줄 개수가 4개보다 클 동안 1일 추가
  while (state.schedule.filter(item => item.date == `${makeTimeStamp(overDate)}`).length >= 4) {
    overDate.setDate(overDate.getDate() + 1)
  }
  scheduleRender(makeTimeStamp(overDate), location)
  return;

  scheduleRender(date, location)
})

/* 
  - 남은 구현 목록
  1. 현재 드래그한 요소의 인덱스가 앞 요소의 인덱스보다 작으면 막기
  2. 시작 지점 드래그하면 다같이 옮겨짐
  3. 다 차있는 상태에서 요소가 더해지면 앞으로 하나씩 옮겨짐
*/

document.body.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("day-schedule")) {
    e.target.classList.add("day-dragging")
  }
})

document.body.addEventListener("dragend", (e) => {
  if (e.target.classList.contains("day-schedule")) {
    e.target.classList.remove("day-dragging")
  }
})

function scheduleRender(date, location) {
  state.schedule.push({ date, location }); // 일정 추가
  state.currentIdx++;
  renderCourseList();
  renderAll()
}

function makeTimeStamp(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  // date.getMonth()는 0 ~ 11 반환
}

function inputSetting() {
  const dates = state.schedule.map(item => new Date(item.date))
  const start = new Date(Math.min(...dates))
  const end = new Date(Math.max(...dates))

  $("[name='start_date']").value = makeTimeStamp(start)
  $("[name='end_date']").value = makeTimeStamp(end)
  $("[name='tour_course']").value = courseData.routeText
  
}

let current = new Date()
const now = new Date()
const dates = '일월화수목금토'.split("")

function render(date, content, title) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const weeks = dates.map(d => `<div class="week">${d}</div>`).join("")
  const padding = "<div class='day'></div>".repeat(new Date(year, month, 1).getDay())
  const days = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => {
    const day = i + 1
    const isPast = new Date(year, month, day) <= new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const currentDate = `${year}-${month + 1}-${day}`;

    const currentDateScheduleLocations = state.schedule.filter(({ date }) => date === currentDate)
    return `<div class='day ${isPast ? "disabled" : ""}' data-date='${currentDate}'>
      <span>${day}</span>
      ${currentDateScheduleLocations.map(({ location }) => `<p class='day-schedule' draggable="true">${location}</p>`).join('')}
    </div>`
  }).join("")
  content.innerHTML = weeks + padding + days
  title.textContent = `${year}년 ${month + 1}월`
}

function renderAll() {
  const nextMonth = new Date(current)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  render(current, $(".current-calendar"), $(".current-title"))
  render(nextMonth, $(".next-calendar"), $(".next-title"))
  inputSetting()
}

$(".prev-btn").onclick = () => {
  current.setMonth(current.getMonth() - 1)
  renderAll()
}
$(".next-btn").onclick = () => {
  current.setMonth(current.getMonth() + 1)
  renderAll()
}

renderAll()
renderCourseList()