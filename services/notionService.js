// services/notionService
const parseDirectory = require("../utils/directoryParser")
const notionRepo = require("../repositories/notionRepo")

module.exports = {
  postTask: async ({ planName, databaseId, platformName }) => {
    try {
      const parentPageId = await notionRepo.findParentPageId({
        databaseId,
        planName,
      })

      const data = await parseDirectory({ platformName })

      await notionRepo.addItemsToDatabase({ data, parentPageId, databaseId })
    } catch (error) {
      console.error("發生錯誤:", error)
    }
  },
  getAllPlans: notionRepo.getAllPlans,
}
