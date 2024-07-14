// notionService
const { parseDirectory } = require("../utils/directoryParser")

async function app({ notion, databaseId }) {
  try {
    const notionRepo = require("../repositories/notionRepo")({
      notion,
      databaseId,
    })

    const parentPageId = await notionRepo.findParentPageId({
      PlanName: "Heptabase筆記教學課程",
    })
    const data = parseDirectory()
    await notionRepo.addItemsToDatabase({ data, parentPageId })
  } catch (error) {
    console.error("發生錯誤:", error)
  }
}

module.exports = app
