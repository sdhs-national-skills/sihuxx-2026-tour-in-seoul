/* 
  - 남은 구현 목록
  1. 현재 드래그한 요소의 인덱스가 앞 요소의 인덱스보다 작으면 막기 (c)
  2. 시작 지점 드래그하면 다같이 옮겨짐
  3. 다 차있는 상태에서 요소가 더해지면 앞으로 하나씩 옮겨짐
*/

const courseData = JSON.parse(localStorage.getItem("course"))
const courseList = $(".course-list")
const courseRoute = courseData.routeText.split("->")
const calendar = $(".calendar-content")
const startLocation = courseRoute[0]
const endLocation = courseRoute.at(-1)

const MAX_PER_DAY = 4

// 상태
const state = {
  currentIdx: 0,
  schedule: []
}

function milisecondsToDays(miliseconds) {
  const days = miliseconds / 1000 / 60 / 60 / 24;
  return days;
}

// 코스 목록 랜더링 함수 
function renderCourseList() {
  courseList.innerHTML = courseRoute.map((location, idx) => `<div data-location="${location}" class="course-route ${idx !== state.currentIdx ? 'disabled' : ''}" draggable="true">${location}</div>`).join('');
}

// ── 공통 헬퍼 ──

// 코스 순서 기준 정렬
function sortByRoute() {
  state.schedule.sort(
    (a, b) => courseRoute.indexOf(a.location) - courseRoute.indexOf(b.location)
  )
}

// 조건 1: 이전 코스보다 앞선 날짜면 true
function isBeforePrev(targetText, dropDate) {
  const idx = courseRoute.indexOf(targetText)
  if (idx <= 0) return false
  const prev = state.schedule.find(item => item.location === courseRoute[idx - 1])
  if (!prev) return false
  return new Date(dropDate) < new Date(prev.date)
}

// 특정 날짜의 일정 개수
function countOnDate(dateStr) {
  return state.schedule.filter(item => item.date === dateStr).length
}

// [새 요소 추가용] 꽉 찬 날이면 "뒤 날짜(미래)"로 빈 날 찾기
function findAvailableDateForward(date) {
  const d = new Date(date)
  while (countOnDate(makeTimeStamp(d)) >= MAX_PER_DAY) {
    d.setDate(d.getDate() + 1)
  }
  return makeTimeStamp(d)
}

// [캘린더 내 이동용] 꽉 차면 그 날 "맨 앞" 요소를 하루 전으로 밀어냄 (연쇄)
function pushOverflowBackward(targetDate) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  while (countOnDate(targetDate) > MAX_PER_DAY) {
    const items = state.schedule
      .filter(item => item.date === targetDate)
      .sort((a, b) => courseRoute.indexOf(a.location) - courseRoute.indexOf(b.location))
    const head = items[0]

    const prevDate = new Date(targetDate)
    prevDate.setDate(prevDate.getDate() - 1)

    if (prevDate <= today) {
      alert("더 이상 앞으로 밀 수 있는 날짜가 없습니다")
      return false
    }

    const prevDateStr = makeTimeStamp(prevDate)
    head.date = prevDateStr
    targetDate = prevDateStr
  }
  return true
}

// 드래그 시작 시 .dragging 클래스 붙임
document.body.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('course-route')) {
    e.target.classList.add("dragging")
  }
});

// 드래그 종료 시 .dragging 클래스 지움
document.body.addEventListener('dragend', (e) => {
  if (e.target.classList.contains('course-route')) {
    e.target.classList.remove("dragging")
  }
});

// 달력 안 기존 일정 드래그
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

// 드롭 허용
calendar.addEventListener("dragover", (e) => { e.preventDefault() })

// 드롭 이벤트
calendar.addEventListener("drop", (e) => {
  e.preventDefault()
  if (e.target.classList.contains("disabled")) return

  const droppedDay = e.target.closest(".day")
  if (!droppedDay) return
  const { date } = droppedDay.dataset

  const draggingItem = $(".dragging")        // 코스 목록에서 끌어온 새 요소
  const dayDraggingItem = $(".day-dragging") // 달력 안의 기존 일정

  // ── 경우 2: 캘린더 안에서 기존 일정 이동 (앞으로 하나씩 밀기) ──
  if (dayDraggingItem) {
    const targetText = dayDraggingItem.textContent.trim()
    const idx = courseRoute.indexOf(targetText)

    if (isBeforePrev(targetText, date)) {
      return alert("이전 일정보다 앞선 날짜로 이동 할 수 없습니다")
    }

    // 조건 2: 시작 지점이면 전체를 같은 간격만큼 이동
    if (idx === 0) {
      const startItem = state.schedule.find(item => item.location === startLocation)
      const diff = milisecondsToDays(new Date(date) - new Date(startItem.date))
      state.schedule = state.schedule.map(({ date: d, location }) => {
        const nd = new Date(d)
        nd.setDate(nd.getDate() + diff)
        return { date: makeTimeStamp(nd), location }
      })
    } else {
      // 일단 그 날짜로 옮긴 뒤, 4개 초과면 맨 앞 요소를 과거로 밀어냄 (도미노)
      const target = state.schedule.find(item => item.location === targetText)
      target.date = date
      if (!pushOverflowBackward(date)) return
    }

    sortByRoute()
    return renderAll()
  }

  // ── 경우 1: 코스 리스트에서 새 요소 추가 (뒤로 밀기) ──
  if (!draggingItem) return
  const { location } = draggingItem.dataset
  const targetText = draggingItem.textContent.trim()

  if (isBeforePrev(targetText, date)) {
    return alert("이전 일정보다 앞선 날짜로 이동 할 수 없습니다")
  }

  const last = state.schedule.at(-1)
  if (last) {
    const diffDays = Math.floor(
      (new Date(date) - new Date(last.date)) / (1000 * 60 * 60 * 24)
    )
    if (diffDays > 1) return alert("연속된 날짜가 아닙니다")
  }

  // 꽉 찬 날이면 뒤 날짜로 밀어서 추가
  const slot = findAvailableDateForward(date)
  state.schedule.push({ date: slot, location })
  state.currentIdx++
  sortByRoute()
  renderCourseList()
  renderAll()
})

function makeTimeStamp(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
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

    const currentDateScheduleLocations = state.schedule
      .filter(({ date }) => date === currentDate)
      .sort((a, b) => courseRoute.indexOf(a.location) - courseRoute.indexOf(b.location))
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