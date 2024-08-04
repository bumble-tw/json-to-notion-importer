// models/index.js
const fs = require("fs")
const path = require("path")
const basename = path.basename(__filename)

const db = {}

// 自動加載模型文件
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    )
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))
    db[file.slice(0, -8)] = model
  })

module.exports = db
