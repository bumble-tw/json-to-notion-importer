// models/index.js
const fs = require("fs")
const path = require("path")
const basename = path.basename(__filename)

const db = {}

// 從 notion.js 中引入 Notion 客戶端
const notion = require("./notion")

// 自動加載模型文件
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    )
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))
    db[model.name] = model
  })

db.notion = notion

module.exports = db
