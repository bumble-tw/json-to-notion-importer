// services/notionService
const parseDirectory = require("../utils/directoryParser")
const repos = require("../repositories")
const inquirer = require("inquirer")
const { consoleDetail } = require("../utils/consoleTool")
const consoleTool = require("../utils/consoleTool")

const PLATFORMS = ["PressPlay", "Hahow", "Hiskio", "Udemy", "Youtube"]

module.exports = {
  addTask: async () => {
    try {
      const plans = await repos.notion.getAllPlans()

      const { plan: planName } = await inquirer.prompt([
        {
          type: "list",
          name: "plan",
          message: "請選擇計畫:",
          choices: plans.map((p) => ({ name: p.name, value: p.id })),
        },
      ])

      const { platformName } = await inquirer.prompt([
        {
          type: "list",
          name: "platformName",
          message: "請選擇平台名稱:",
          choices: PLATFORMS,
        },
      ])

      const data = await parseDirectory({ platformName })

      const parentPageId = await repos.notion.findParentPageId({
        planName,
      })

      await repos.notion.addItemsToDatabase({ data, parentPageId })

      console.log("任務新增成功")
    } catch (error) {
      console.error("任務新增失敗", error)
    }
  },
  getNotionDatabaseData: async () => {
    try {
      const databaseData = await repos.notion.getDatabaseData()
      // consoleDetail("Notion 資料庫資料", databaseData[0])
      const propertiesOption = await repos.notion.getDatabasePropertiesOption()
      consoleDetail("Notion 資料庫屬性", propertiesOption, true, false)
    } catch (error) {
      console.log("取得資料庫資料失敗", error)
    }
  },
  syncCSVNewRowToNotion: async () => {
    try {
      const csvData = await repos.csv.parseData()
      const csvHeader = csvData[0]
      const csvRows = csvData.slice(1)

      const databaseData = await repos.notion.getDatabaseData()
      const databaseIDs = new Set(
        databaseData.map((item) => item.ID.unique_id.number.toString())
      )

      const newPages = []

      for (let rowIndex = 0; rowIndex < csvRows.length; rowIndex++) {
        const row = csvRows[rowIndex]
        const rowData = {}
        for (let i = 0; i < csvHeader.length; i++) {
          rowData[csvHeader[i]] = row[i]
        }

        if (!databaseIDs.has(rowData.ID)) {
          // 將新的項目儲存在 newPages 中
          const pageData = {
            Route: {
              type: "title",
              title: [{ type: "text", text: { content: rowData.Route } }],
            },
            分類: {
              type: "multi_select",
              multi_select: rowData["分類"]
                ? rowData["分類"].split(",").map((name) => ({ name }))
                : [],
            },
            功能概述: {
              type: "rich_text",
              rich_text: [
                { type: "text", text: { content: rowData["功能概述"] } },
              ],
            },
            權限: {
              type: "select",
              select: rowData["權限"] ? { name: rowData["權限"] } : null,
            },
            Priority: {
              type: "select",
              select: rowData.Priority ? { name: rowData.Priority } : null,
            },
            "後端-功能描述": {
              type: "rich_text",
              rich_text: [
                { type: "text", text: { content: rowData["後端-功能描述"] } },
              ],
            },
            "前端-功能描述": {
              type: "rich_text",
              rich_text: [
                { type: "text", text: { content: rowData["前端-功能描述"] } },
              ],
            },
            輸入: {
              type: "rich_text",
              rich_text: [{ type: "text", text: { content: rowData["輸入"] } }],
            },
            輸出: {
              type: "rich_text",
              rich_text: [{ type: "text", text: { content: rowData["輸出"] } }],
            },
            // Method: {
            //   type: "select",
            //   select: rowData.Method ? { name: rowData.Method } : null,
            // },
            // SQL: {
            //   type: "rich_text",
            //   rich_text: [{ type: "text", text: { content: rowData.SQL } }],
            // },
            // 程式碼流程: {
            //   type: "rich_text",
            //   rich_text: [
            //     { type: "text", text: { content: rowData["程式碼流程"] } },
            //   ],
            // },
            // 後端負責人: {
            //   type: "select",
            //   select: rowData["後端負責人"]
            //     ? { name: rowData["後端負責人"] }
            //     : null,
            // },
            // 前端負責人: {
            //   type: "select",
            //   select: rowData["前端負責人"]
            //     ? { name: rowData["前端負責人"] }
            //     : null,
            // },
          }
          // 移除值為 null 或空字串的屬性
          Object.keys(pageData).forEach((key) => {
            if (pageData[key] && pageData[key].select === null) {
              delete pageData[key]
            }
          })
          console.log(`新增項目: ${rowData.ID}`)
          const createdResult = await repos.notion.createPage({
            data: pageData,
          })
          const ID = createdResult.properties.ID.unique_id.number
          await repos.csv.writeCell({ data: ID, columnName: "ID", rowIndex })
        } else {
          console.log(`項目已存在: ${rowData.ID}`)
        }
      }
    } catch (error) {
      console.log("同步失敗", error)
    }
  },

  writeCellTest: async () => {
    try {
      const data = "test"
      const columnName = "ID"
      const rowIndex = 90
      await repos.csv.writeCell({ data, columnName, rowIndex })
    } catch (error) {
      console.error("Error writing cell:", error)
    }
  },
}
