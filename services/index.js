// services/index.js

const fs = require("fs")
const path = require("path")
const basename = path.basename(__filename)

const svc = {}

// 自動加載 repositories 文件
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
    const service = require(path.join(__dirname, file))
    svc[file.slice(0, -10)] = service
  })

module.exports = svc
