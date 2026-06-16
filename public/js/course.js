// station.json 안 data 안의 모든 staton 객체 가져옴
const datas = await fetch("/asset/station.json").then(res => res.json()).then(({ data }) => data);
const ctx = canvas.getContext('2d');
const controlModal = $(".control-modal")
const sortBtns = $$(".sort-btns button")
const list = $(".course-list")
// 호선 번호 색깔 (1호선: 파랑, 2호선; 초록)
const colorMap = {
  1: 'blue',
  2: 'green',
  3: 'brown',
  4: 'pink',
  5: 'gold',
}
const map = {} // 역 연결 그래프 { 역 idx: [{ to: ..., line: ..., distance: ... }] }
let resultPath = [] // 경로 검색 결과 5개
let startPlace = null // 출발역 idx
let endPlace = null // 도착역 idx
let selectedCourse = null // 코스 목록에서 선택한 경로

// 지도 전체를 다시 그리는 함수
// drawRoute() 호출마다 가장 먼저 호출 (캔버스 초기화)
function drawMap() {
  // 캔버스 초기화
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 지하철 라인 그리기
  datas.map((station) => {
    const route = station.route;
    const [x, y] = station.coordinates; // 현재 역 좌표

    Object.entries(route).forEach(([key, value]) => {
      // key: 2 (호선) / value: [2, 3] (연결된 역 idx)
      value.forEach(valueRoutes => {
        // data에서 다음 역의 idx와 현재 valueRoute의 idx가 같은 station 찾아서 좌표 불러오기
        // -> 연결된 다음 역의 좌표 찾기
        const [toX, toY] = datas.find(stat => stat.idx === valueRoutes).coordinates;
        ctx.beginPath();
        ctx.moveTo(x, y); // 현재 역에서
        ctx.lineTo(toX, toY); // 다음 역까지
        ctx.strokeStyle = colorMap[key];
        ctx.stroke();
      })
    })
  })

  // 지하철 역 원 그리기
  datas.map(d => {
    const [x, y] = d.coordinates;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = colorMap[Object.keys(d.route)[0]]; // 첫번째 호선 색깔로 채움
    ctx.fill();
  })

  // 지하철 역 이름 그리기
  datas.map(d => {
    const name = d.name;
    const [x, y] = d.coordinates;
    const padding = 15
    ctx.beginPath()
    ctx.fillStyle = '#333'
    ctx.fillText(name, x + padding, y + padding) // 역 좌표 오른쪽에 텍스트 그리기
  })
}

// 선택한 경로를 지도에 하이라이트로 표시하는 함수
function drawRoute(course) {
  drawMap() // 지도 초기화

  const stationList = course.path.map(idx => findStationByIdx(idx))

  const transferSet = new Set()
  course.path.forEach((idx, i) => {
    if (i === 0 || i === course.path.length - 1) return
    const prevEdge = (map[course.path[i - 1]] || []).find(e => e.to === idx)
    const nextEdge = (map[idx] || []).find(e => e.to === course.path[i + 1])
    if (prevEdge && nextEdge && prevEdge.line !== nextEdge.line) {
      transferSet.add(idx)
    }
  })

  ctx.beginPath()
  ctx.strokeStyle = "yellow"
  ctx.lineWidth = 5
  stationList.forEach(({ coordinates: [x, y] }, i) => {
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.stroke()
  ctx.lineWidth = 1

  stationList.forEach((station, i) => {
    const [x, y] = station.coordinates
    const isStart = i === 0
    const isEnd = i === stationList.length - 1
    const isTransfer = transferSet.has(station.idx)

    ctx.beginPath()
    ctx.arc(x, y, isTransfer ? 12 : 10, 0, Math.PI * 2)
    ctx.fillStyle = isStart ? "blue" : isEnd ? "red" : isTransfer ? "orange" : "yellow"
    ctx.fill()
    ctx.lineWidth = 1
  })
}

// 캔버스 클릭 이벤트 (출발지 ~ 도착지 설정)
canvas.addEventListener('mousedown', ({ offsetX: x, offsetY: y }) => {
  const radius = 10
  datas.map(d => {
    const [routeX, routeY] = d.coordinates // 각 역의 좌표값을 저장함
    // Math.abs(): 음수든 양수든 무조건 양수(절댓값)로 바꿔주는 함수
    const xDiff = Math.abs(x - routeX) // 클릭한 x 좌표와 역 x 좌표의 차이
    const yDiff = Math.abs(y - routeY) // 클릭한 y 좌표와 역 y 좌표의 차이

    // 차이가 10 이내면 그 역을 클릭한 것으로 판단
    if (xDiff <= radius && yDiff <= radius) {
      // 클릭한 역 근처 (15px 떨어진 곳)에 모달 표시
      controlModal.style.display = 'flex'
      controlModal.style.left = routeX + 15 + "px"
      controlModal.style.top = routeY + 15 + "px"

      // 출발지 버튼 클릭 시 -> 클릭한 역 idx를 startPlace(전역)에 저장
      $(".start-place-btn").onclick = () => {
        startPlace = d.idx
        settingPlace()
      }
      // 도착지 버튼 클릭 시 -> 클릭한 역 idx를 endPlace(전역)에 저장
      $(".end-place-btn").onclick = () => {
        endPlace = d.idx
        settingPlace()
      }
    }
  })
})

// idx로 역 객체 찾아서 반환하는 함수
function findStationByIdx(targetIdx) {
  return datas.find(station => station.idx === targetIdx)
}

// 출발/도착지 이름을 화면에 업데이트 하는 함수
function settingPlace() {
  // idx로 역 이름 찾아서 이름 표시
  $(".start-place").textContent = findStationByIdx(startPlace)?.name
  $(".end-place").textContent = findStationByIdx(endPlace)?.name
}

// 두 역 사이 직선 거리 계산 (피타고라스 공식)
function getDistance(currentStation, nextStation) {
  // 역 정보가 없으면 에러 방지용으로 0 반환 후 종료
  if (!currentStation || !nextStation) return 0;
  const [x1, y1] = currentStation.coordinates // 현재 역 좌표 반환
  const [x2, y2] = nextStation.coordinates // // 다음 역 좌표 반환
  // 두 점 사이의 거리(대각선)를 구한 뒤 정수로 반올림
  // 피타고라스 공식 √((x2-x1)² + (y2-y1)²)
  return Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)))
  // Math.pow(a, b) → a의 b제곱 (a²)
  // Math.sqrt(a) → a의 제곱근 (√a)
  // Math.round(a) → 소수점 반올림
}

// 각 역에서 갈 수 있는 역, 호선, 거리를 미리 정리해두는 함수
// map[역idx] = [{ to: 다음역idx, line: 호선, distance: 거리 }, ...]
datas.forEach(station => {
  const currentIdx = station.idx // 현재 접근 역 idx
  map[currentIdx] = [] // push할 초기화 배열 생성

  Object.entries(station.route).forEach(([line, nextStationIdxArr]) => {
    // line: 호선 / nextStationIdxArr: 연결된 역 idx 배열
    nextStationIdxArr.forEach(nextStationIdx => {
      // 현재 접근한 연결된 역 idx를 data에서 찾아서 역 객체 반환
      const nextStation = findStationByIdx(nextStationIdx)
      // station: 현재 객체 인자, nextStation: 다음 객체 인자
      // 좌표 꺼내서 피타고라스 방식으로 대각선 거리 계산
      const dist = getDistance(station, nextStation)

      map[currentIdx].push({
        to: nextStationIdx,
        line: line,
        distance: dist
      })
      // push 후: { 1: [{ to: 2, line: "2", distance: 50 }] }
    })
  })
})

// DFS로 출발->도착 모든 경로 탐색 후 거리 짧은 순으로 5개 반환하는 함수
/* 
  강남 → 역삼 → 선릉 → 막힘! → 돌아옴
  강남 → 역삼 → 교대 → 서초 → 도착!  ✅ 경로 저장
  강남 → 역삼 → 교대 → 방배 → 막힘! → 돌아옴
  강남 → 교대 → 서초 → 도착!  ✅ 경로 저장
  ...이런식으로 모든 길 다 탐색
*/
function getTop5Paths(startNode, endNode) {
  const paths = []

  // dfs(현재역, 방문한 역들, 지금까지 경로, 현재 호선, 총 거리, 환승 횟수)
  const dfs = (current, visited, currentPath, currentLine, totalDistance, transfers) => {
    // 이미 방문한 역이면 중단
    // ex) visited = {1,2,3} 이고 current = 2 면 → return
    if (visited.has(current)) return;

    // 도착역이면 경로 저장
    if (current == endNode) {
      // 지금까지 경로 + 현재 경로 저장
      // ex) currentPath = [1,2,3,4], current = 5 → fullPath = [1,2,3,4,5]
      const fullPath = [...currentPath, current]
      paths.push({
        path: fullPath, // 경로
        routeText: fullPath.map(idx => findStationByIdx(idx)?.name || idx).join("->"), // 텍스트로 변환한 경로
        distance: totalDistance, // 총 거리
        transfers: transfers // 환승 횟수
      })
      return
    }

    // 현재역 방문 처리
    const nextVisited = new Set(visited) // 지나온 역 복사
    nextVisited.add(current) // 현재역 추가

    // 연결된 다음 역들로 재귀 호출
    const neighbors = map[current] || []
    // 현재 역에 해당하는 [{to, line, distance}] 정보 불러옴
    neighbors.forEach(({ to, line, distance }) => {
      // 환승 했는지 여부 판단 (Boolean)
      /* (ex)
        currentLine = "2", line = "3" → isTransfer = true
        currentLine = "2", line = "2" → isTransfer = false
      */
      const isTransfer = currentLine !== null && currentLine !== line
      // 환승 횟수
      /* (ex)
        isTransfer = true  → nextTransfers = transfer에 +1
        isTransfer = false → nextTransfers = transfer
      */
      const nextTransfers = isTransfer ? transfers + 1 : transfers
      dfs(
        to, // 다음 역 idx
        nextVisited, // 방문 목록
        [...currentPath, current], // 경로 + 현재역
        line, // 현재 호선
        totalDistance + distance, // 누적 거리
        nextTransfers // 환승 횟수
      )
    })
  }
  dfs(startNode, new Set(), [], null, 0, 0)
  // 시작역부터 다시 경로 찾음

  // path: 지금까지의 경로를 모두 저장한 배열
  return paths
    .sort((a, b) => a.distance - b.distance) // 찾은 경로를 거리순 정렬
    .slice(0, 5) // 상위 5개만 나오게 자름
}

// getTop5Paths()에서 찾은 코스 목록을 HTML에 띄움
function renderCourseList(paths, sort) {
  // sort 값에 따라 paths 배열 순서 정렬
  const sorted = [...paths].sort((a, b) =>
    sort === 0 ? a.distance - b.distance :
      sort === 1 ? a.transfers - b.transfers : 0
  )

  // 정렬된 경로들을 li 태그로 변환하여 한번에 랜더링
  list.innerHTML = sorted.map(({ routeText, distance, transfers }) =>
    // routeText: 경로 텍스트, distance: 누적 거리, transfer: 환승 횟수
    `<li class="item">
      <p class="course-route">${routeText}</p>
      <p class="course-distance">거리: ${distance}</p>
      <p class="course-transfer">환승 횟수: ${transfers}</p>
    </li>`).join("")

  // 각 목록 항목 클릭 이벤트
  $$(".course-list .item").forEach((item, i) => {
    item.onclick = () => {
      // 모든 항목 선택 효과(selected) 제거
      $$(".course-list .item").forEach(el => el.classList.remove("selected"))
      // 클릭한 항목만 선택 효과(selected) 추가
      item.classList.add("selected")
      // 선택 경로 저장 변수(전역 변수)에 클릭한 경로 저장
      selectedCourse = sorted[i]
      // 지도에 해당 경로 표시
      drawRoute(selectedCourse)
    }
  })
}

// 경로 검색 버튼 클릭 이벤트
$(".search-btn").onclick = () => {
  // 출발&도착 중 하나라도 값이 null이면 알림 후 종료
  if (!startPlace || !endPlace) {
    alert("출발지와 도착지를 모두 설정해주세요")
    return
  }
  // 경로 탐색 후 환승순(초기 sort 값)으로 렌더링
  resultPath = getTop5Paths(startPlace, endPlace)
  renderCourseList(resultPath, 1)
}

// 경로 정렬 버튼 클릭 이벤트
sortBtns.forEach((btn, i) => {
  btn.onclick = () => {
    // 검색 결과 없으면 알림 후 종료
    if (resultPath.length === 0) {
      alert("코스를 먼저 지정해주세요")
      return
    }
    // i기 sort 기준(0 = 거리 순, 1 = 환승 순)
    renderCourseList(resultPath, i)
    // 모든 버튼 active 효과 제거 후 클릭한 버튼만 active
    sortBtns.forEach(allBtns => allBtns.classList.remove('active'))
    btn.classList.add("active")
  }
})

// 일정 설정 버튼 클릭 이벤트
$(".schedule-btn").onclick = () => {
  // 선택된 코스 없으면(null이면) 알림 후 종료
  if (!selectedCourse) {
    alert("선택된 투어 코스가 없습니다")
    return
  }
  const courseNames
  // 선택한 코스 localStorage에 저장 (/schedule 페이지에서 꺼내서 사용)
  localStorage.setItem("course", JSON.stringify(selectedCourse))
  // 현재 페이지 왼쪽으로 0.5초 동안 슬라이드
  $(".page-course").style.transform = 'translateX(-100%)'

  // 0.5초 후 /schedule로 페이지 이동
  setTimeout(() => {
    location.href = "/schedule"
  }, 500)
}

// 페이지 로드 시 지도 그리기
drawMap()