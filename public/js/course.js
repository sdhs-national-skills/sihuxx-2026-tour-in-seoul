const datas = await fetch("/asset/station.json").then(res => res.json()).then(({ data }) => data);
const ctx = canvas.getContext('2d');
const controlModal = $(".control-modal")
const colorMap = {
  1: 'blue',
  2: 'green',
  3: 'brown',
  4: 'pink',
  5: 'gold',
}

// 지하철 라인 그리기
datas.map((station) => {
  const route = station.route;
  const [x, y] = station.coordinates;

  Object.entries(route).forEach(([key, value]) => {
    value.forEach(valueRoutes => {
      const [toX, toY] = datas.find(stat => stat.idx === valueRoutes).coordinates;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(toX, toY);
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
  ctx.fillStyle = colorMap[Object.keys(d.route)];
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y);
  ctx.stroke();
})

// 지하철 역 이름 그리기
datas.map(d => {
  const name = d.name;
  const [x, y] = d.coordinates;
  const padding = 15
  ctx.beginPath()
  ctx.fillStyle = '#333'
  ctx.fillText(name, x + padding, y + padding)
})

let startPlace = null
let endPlace = null

canvas.addEventListener('mousedown', ({ offsetX: x, offsetY: y }) => {
  const radius = 10
  datas.map(d => {
    const [routeX, routeY] = d.coordinates
    const xDiff = Math.abs(x - routeX)
    const yDiff = Math.abs(y - routeY)

    if (xDiff <= radius && yDiff <= radius) {
      controlModal.style.display = 'flex'
      controlModal.style.left = routeX + 15 + "px"
      controlModal.style.top = routeY + 15 + "px"
      $(".start-place-btn").onclick = () => {
        startPlace = d.idx
        settingPlace()
      }
      $(".end-place-btn").onclick = () => {
        endPlace = d.idx
        settingPlace()
      }
    }
  })
})

function settingPlace(start, end) {
  $(".start-place").textContent = findStationByIdx(startPlace)?.name
  $(".end-place").textContent = findStationByIdx(endPlace)?.name
}

function getDistance(stationA, stationB) {
  if (!stationA || !stationB) return 0;
  const [x1, y1] = stationA.coordinates
  const [x2, y2] = stationB.coordinates
  // 두 점 사이의 거리를 구한 뒤 정수로 반올림
  return Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)))
}

function findStationByIdx(targetIdx) {
  return datas.find(station => station.idx === targetIdx)
}

const map = {}
datas.forEach(station => {
  const currentIdx = station.idx
  map[currentIdx] = []
  
  Object.entries(station.route).forEach(([line, nextStationArr]) => {
    nextStationArr.forEach(nextIdx => {
      const nextStation = findStationByIdx(nextIdx)
      const dist = getDistance(station, nextStation)
      map[currentIdx].push({
        to: nextIdx,
        line: line,
        distance: dist
      })
    })
  })
})

function getTop5Paths(startNode, endNode) {
  const paths = []

  const dfs = (current, visited, currentPath, currentLine, totalDistance, transfers) => {
    if (visited.has(current)) return;
    
    if (current == endNode) {
      const fullPath = [...currentPath, current]
      paths.push({
        routeText: fullPath.map(idx => findStationByIdx(idx)?.name || idx).join("->"),
        distance: totalDistance,
        transfers: transfers
      })
      return
    }

    const nextVisited = new Set(visited)
    nextVisited.add(current)

    const neighbors = map[current] || []
    neighbors.forEach(({ to, line, distance }) => {
      const isTransfer = currentLine !== null && currentLine !== line
      const nextTransfers = isTransfer ? transfers + 1 : transfers
      dfs(
        to,
        nextVisited,
        [...currentPath, current],
        line,
        totalDistance + distance,
        nextTransfers
      )
    })
  }
  dfs(startNode, new Set(), [], null, 0, 0)


  return paths
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
}

let resultPath = []

function renderCourseList(paths, sort) {
  const list = $(".course-list")
  const sorted = [...paths].sort((a, b) =>
    sort === 0 ? a.distance - b.distance :
      sort === 1 ? a.transfers - b.transfers : 0
  )
  list.innerHTML = sorted.map(({ routeText, distance, transfers }) =>
    `<li class="item">
      <p class="course-route">${routeText}</p>
      <p class="course-distance">거리: ${distance}</p>
      <p class="course-transfer">환승 수: ${transfers}</p>
    </li>`).join("")
}

$(".search-btn").onclick = () => {
  resultPath = getTop5Paths(startPlace, endPlace)
  renderCourseList(resultPath, 1)
}
$$(".sort-btns button").forEach(btn => {
  $$(".sort-btns").forEach(allBtns => allBtns.classList.remove('active'))
  btn.classList.add("active")
})

$(".distance-sort-btn").onclick = () => renderCourseList(resultPath, 0)
$(".transfer-sort-btn").onclick = () => renderCourseList(resultPath, 1)
