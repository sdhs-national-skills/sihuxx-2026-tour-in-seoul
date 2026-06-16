const courseData = JSON.parse(localStorage.getItem("course"))
const courseList = $(".course-list")
const courseRoute = courseData.routeText.split("->")
const calendar = $(".calendar-content")

const state = {
  currentIdx: 0,
  schedule: []
}


function renderCourseList() {
courseList.innerHTML = courseRoute.map((location, idx) => `<div data-location="${location}" class="course-route ${idx !== state.currentIdx ? 'disabled' : ''}" draggable="true">${location}</div>`).join('');
}


document.body.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('course-route')) {
    e.target.classList.add("dragging")
  }
});

document.body.addEventListener('dragend', (e) => {
  if (e.target.classList.contains('course-route')) {
    e.target.classList.remove("dragging")
  }
});

calendar.addEventListener("dragover", (e) => { e.preventDefault() })
calendar.addEventListener("drop", (e) => {
  e.preventDefault()
  // const targetDate = e.target.dataset.date

  const draggingItem = $(".dragging")
  const droppedDay = e.target.closest(".day");

  if (!draggingItem || !droppedDay) return;


  const { dataset: { location }} = draggingItem;
  const { dataset: { date }} = droppedDay;

  const previousScheduleDate = structuredClone(state.schedule).pop();
  if (!previousScheduleDate)  {
    state.schedule.push({ date, location });
    state.currentIdx++;
    renderCourseList();
    renderAll()
    return;
  } 
  const prevDate = new Date(previousScheduleDate.date) 
  const droppedDate = new Date(date);


const diffDays = Math.floor(
  (droppedDate - prevDate) / (1000 * 60 * 60 * 24)
);

if (diffDays > 1) return alert('무함?');
  
    state.schedule.push({ date, location });
    state.currentIdx++;
    renderCourseList();
    renderAll()
    return;
  
  
  // e.target.closest(".day").append(draggingItem.cloneNode(true));
  
  console.log(state)
})

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
    const currentDate = `${year}-${month}-${day}`;

    const currentDateScheduleLocations = state.schedule.filter(({ date }) => date === currentDate)
    console.log(currentDateScheduleLocations.length)
    return `<div class='day ${isPast ? "disabled" : ""}' data-date='${currentDate}'>
      <span>${day}</span>
      ${currentDateScheduleLocations.map(({ location }) => `<p>${location}</p>`).join('')}
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