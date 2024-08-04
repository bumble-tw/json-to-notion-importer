// models/notion.js
const { Client } = require("@notionhq/client")

// 初始化 Notion 客戶端
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

module.exports = notion
