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
  writeCell: async ({ data, columnName, rowIndex }) => {
    try {
      await db.csv.writeToCell(data, columnName, rowIndex)
    } catch (error) {
      console.error("寫入 CSV 儲存格失敗", error)
    }
  },
}
