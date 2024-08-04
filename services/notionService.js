// services/notionService
const parseDirectory = require("../utils/directoryParser")
const notionRepo = require("../repositories/notionRepo")
const inquirer = require("inquirer")

const PLATFORMS = ["PressPlay", "Hahow", "Hiskio", "Udemy", "Youtube"]

module.exports = {
  addTask: async () => {
    try {
      const plans = await notionRepo.getAllPlans()

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

      const parentPageId = await notionRepo.findParentPageId({
        planName,
      })

      await notionRepo.addItemsToDatabase({ data, parentPageId })

      console.log("任務新增成功")
    } catch (error) {
      console.error("任務新增失敗", error)
    }
  },
}
