//models/index.js
const { Client } = require("@notionhq/client")
const fs = require("fs")
const path = require("path")
const basename = path.basename(__filename)

const db = {}

// 初始化 Notion 客戶端
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// 自動加載模型文件
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    )
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(notion)
    db[model.name] = model
  })

db.notion = notion

module.exports = db
