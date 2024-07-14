const fs = require("fs")
const path = require("path")

// 讀取並解析 data/directory2.json
const directoryPath = path.join(__dirname, "../data/directory2.json")
const { chapter_timelines } = JSON.parse(fs.readFileSync(directoryPath, "utf8"))

// 將秒數轉換為分秒格式
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

// 解析函數
function parseDirectory() {
  // 假設 directoryData 是一個陣列，每個元素包含 link_url, timeline_title, duration (秒)
  const result = chapter_timelines
    .filter(({ attachment_type }) => attachment_type[0] === "video")
    .map(({ link_url, timeline_title, duration }) => {
      return {
        link_url: link_url,
        timeline_title: timeline_title,
        duration: formatDuration(duration),
      }
    })

  return result
}

// 匯出解析函數
module.exports = {
  parseDirectory,
}
