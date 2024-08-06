// index.js
const inquirer = require("inquirer")
const svc = require("./services")

const choices = [
  // { label: "新增任務", value: "addTask" },
  { name: "取得 Notion 資料庫資料", value: "getNotionDatabaseData" },
  { name: "同步 CSV 到 Notion", value: "syncCSVNewRowToNotion" },
  { name: "寫入 儲存格 測試", value: "writeCellTest" },
  { name: "退出", value: "exit" },
]

const promptUser = async () => {
  try {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "請選擇操作:",
        choices,
      },
    ])

    if (action === "exit") {
      console.log("退出程序")
      return
    } else {
      await svc.notion[action]()
      await promptUser() // 執行完成後再次詢問
    }
  } catch (error) {
    console.error("操作失敗", error)
  }
}

promptUser() // 啟動時第一次詢問
