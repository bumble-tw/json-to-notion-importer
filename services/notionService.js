// services/notionService
const parseDirectory = require("../utils/directoryParser")
const repos = require("../repositories")
const inquirer = require("inquirer")

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
  syncCSVNewPageToNotion: async () => {
    try {
      const csvData = await repos.csv.parseData()
      const csvHeader = csvData[0]
      const csvRows = csvData.slice(1)

      const databaseData = await repos.notion.getDatabaseData()
      console.log("databaseData: ", databaseData[0])
      const databaseIDs = new Set(
        databaseData.map((item) => item.ID.unique_id.number.toString())
      )

      const newPages = []

      for (const row of csvRows) {
        const rowData = {}
        for (let i = 0; i < csvHeader.length; i++) {
          rowData[csvHeader[i]] = row[i]
        }

        if (!databaseIDs.has(rowData.ID)) {
          // 將新的項目儲存在 newPages 中
          const pageData = {
            ID: {
              type: "number",
              number: parseInt(rowData.ID),
            },
            Priority: {
              type: "select",
              select: rowData.Priority ? { name: rowData.Priority } : null,
            },
            功能模組: {
              type: "multi_select",
              multi_select: rowData["功能模組"]
                .split(",")
                .map((name) => ({ name })),
            },
            功能名稱: {
              type: "rich_text",
              rich_text: [
                { type: "text", text: { content: rowData["功能名稱"] } },
              ],
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
            Method: {
              type: "select",
              select: rowData.Method ? { name: rowData.Method } : null,
            },
            Route: {
              type: "title",
              title: [{ type: "text", text: { content: rowData.Route } }],
            },
            權限: {
              type: "select",
              select: rowData["權限"] ? { name: rowData["權限"] } : null,
            },
            輸入描述: {
              type: "rich_text",
              rich_text: [
                { type: "text", text: { content: rowData["輸入描述"] } },
              ],
            },
            輸出描述: {
              type: "rich_text",
              rich_text: [
                { type: "text", text: { content: rowData["輸出描述"] } },
              ],
            },
            SQL: {
              type: "rich_text",
              rich_text: [{ type: "text", text: { content: rowData.SQL } }],
            },
            程式碼流程: {
              type: "rich_text",
              rich_text: [
                { type: "text", text: { content: rowData["程式碼流程"] } },
              ],
            },
            後端負責人: {
              type: "select",
              select: rowData["後端負責人"]
                ? { name: rowData["後端負責人"] }
                : null,
            },
            前端負責人: {
              type: "select",
              select: rowData["前端負責人"]
                ? { name: rowData["前端負責人"] }
                : null,
            },
          }
          // 移除值為 null 或空字串的屬性
          Object.keys(pageData).forEach((key) => {
            if (pageData[key] && pageData[key].select === null) {
              delete pageData[key]
            }
          })
          newPages.push(pageData)
          console.log(`新增項目: ${rowData.ID}`)
        } else {
          console.log(`項目已存在: ${rowData.ID}`)
        }
      }

      // 遍歷 newPages 呼叫 create function
      for (const page of newPages) {
        await repos.notion.createPage({ data: page })
      }
    } catch (error) {
      console.log("同步失敗", error)
    }
  },
}
