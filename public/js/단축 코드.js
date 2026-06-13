function settingPlace() {
  $(".start-place").textContent = findStationByIdx(startPlace)?.name
  $(".end-place").textContent = findStationByIdx(endPlace)?.name
}

function getDistance({ coordinates: [x1, y1] }, { coordinates: [x2, y2] }) {
  return Math.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2))
}

function findStationByIdx(idx) {
  return datas.find(s => s.idx === idx)
}

const map = {}
datas.forEach(({ idx, route }) => {
  map[idx] = Object.entries(route).flatMap(([line, nextArr]) =>
    nextArr.map(nextIdx => ({
      to: nextIdx,
      line,
      distance: getDistance(findStationByIdx(idx), findStationByIdx(nextIdx))
    }))
  )
})

function getTop5Paths(startNode, endNode) {
  const paths = []

  const dfs = (current, visited, path, currentLine, dist, transfers) => {
    if (visited.has(current)) return
    if (current == endNode) {
      paths.push({
        routeText: [...path, current].map(i => findStationByIdx(i)?.name || i).join(" → "),
        distance: dist,
        transfers
      })
      return
    }
    visited.add(current)
    ;(map[current] || []).forEach(({ to, line, distance }) => {
      dfs(to, new Set(visited), [...path, current], line, dist + distance,
        currentLine && currentLine !== line ? transfers + 1 : transfers)
    })
  }

  dfs(startNode, new Set(), [], null, 0, 0)
  return paths.sort((a, b) => a.distance - b.distance).slice(0, 5)
}

function renderCourseList(paths) {
  const list = $(".course-list")
  list.innerHTML = paths.length
    ? paths.map(({ routeText, distance, transfers }) => `
        <li class="item">
          <p class="course-route">${routeText}</p>
          <p class="course-distance">거리: ${distance}</p>
          <p class="course-transfer">환승 수: ${transfers}</p>
        </li>`).join("")
    : "<li>검색된 최적 코스가 없습니다.</li>"
}

$(".search-btn").onclick = () => renderCourseList(getTop5Paths(startPlace, endPlace))