// repositories/csvRepo.js

const db = require("../models")

module.exports = {
  parseData: async () => {
    try {
      const csvData = await db.csv.readData()
      return csvData
    } catch (error) {
      console.error("解析 CSV 失敗", error)
    }
  },
}
