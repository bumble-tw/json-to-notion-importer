const inquirer = require("inquirer")
const app = require("./services/notionService")
const databaseId = process.env.NOTION_DATABASE_ID

const promptUser = async () => {
  try {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "請選擇操作:",
        choices: ["新增任務", "退出"],
      },
    ])

    if (action === "新增任務") {
      // 先獲取所有的計畫
      const plans = await app.getAllPlans(databaseId)
      const { plan } = await inquirer.prompt([
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
          choices: ["PressPlay", "Hahow", "Hiskio", "Udemy", "Youtube"],
        },
      ])

      try {
        await app.postTask({ databaseId, planId: plan, platformName })
        console.log("任務新增成功")
      } catch (error) {
        console.error("任務新增失敗", error)
      }

      promptUser() // 執行完成後再次詢問
    } else {
      console.log("退出程序")
    }
  } catch (error) {
    console.error("操作失敗", error)
  }
}

promptUser() // 啟動時第一次詢問
