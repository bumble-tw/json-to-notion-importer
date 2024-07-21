// utils/directoryParser.js
const fs = require("fs").promises
const path = require("path")

// 讀取 JSON 文件
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    throw new Error(
      `Failed to read or parse JSON file at ${filePath}: ${error.message}`
    )
  }
}

// 根據平台名稱取得對應的資料夾名稱
function getPlatformDirectory(platformName) {
  const nameMap = {
    PressPlay: "pressPlayDirectory",
    udemy: "udemyDirectory",
    youtube: "youTubeDirectory",
    hahow: "hahowDirectory",
    hiskio: "hiskioDirectory",
  }

  const platformKey = nameMap[platformName]
  if (!platformKey) {
    throw new Error(`Platform name ${platformName} not found in nameMap.`)
  }
  return platformKey
}

// 將秒數轉換為分秒格式
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs < 10 ? "0" : ""}${secs}秒`
}

// 資料解析函數
const platformParsers = {
  PressPlay: (data) =>
    data
      .filter(({ attachment_type }) => attachment_type[0] === "video")
      .map(({ link_url, timeline_title, duration, record }) => ({
        link_url,
        timeline_title,
        duration: formatDuration(duration),
        record,
      })),
  Udemy: (data) =>
    data
      .filter(({ attachment_type }) => attachment_type[0] === "video")
      .map(({ link_url, timeline_title, duration, record }) => ({
        link_url,
        timeline_title,
        duration: formatDuration(duration),
        record,
      })),
  Youtube: (data) =>
    data
      .filter(({ attachment_type }) => attachment_type[0] === "video")
      .map(({ videoId, title, length }) => ({
        video_url: `https://www.youtube.com/watch?v=${videoId}`,
        video_title: title,
        duration: formatDuration(length),
      })),
  Hahow: (data) =>
    data
      .filter(({ type }) => type === "video")
      .map(({ url, title, length, notes }) => ({
        video_url: url,
        video_title: title,
        duration: formatDuration(length),
        notes,
      })),
  Hiskio: (data) =>
    data
      .filter(({ type }) => type === "video")
      .map(({ link, title, time, description }) => ({
        video_url: link,
        video_title: title,
        duration: formatDuration(time),
        description,
      })),
  // 可以根據需要添加更多平台的解析函數
}

// 主函數
async function parsePlatformData({ platformName }) {
  const directoryPath = path.join(
    __dirname,
    "../data/platformDirectoryList.json"
  )
  const data = await readJsonFile(directoryPath)
  const platformKey = getPlatformDirectory(platformName)
  const parser = platformParsers[platformName]
  if (!parser) {
    throw new Error(`Parser for platform ${platformName} not found.`)
  }
  return parser(data[platformKey])
}

module.exports = parsePlatformData
