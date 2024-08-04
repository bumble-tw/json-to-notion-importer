// repositories/notionRepo.js

const db = require("../models")
const databaseId = process.env.NOTION_DATABASE_ID

const calculateStatus = (record) => {
  let status
  switch (true) {
    case record.completed >= record.max_completed && record.completed > 0:
      status = "Done"
      break
    case record.completed > 0 && record.completed < record.max_completed:
      status = "In progress"
      break
    case record.completed === 0:
      status = "Not started"
      break
    default:
      status = "Invalid state"
  }
  return status
}

module.exports = {
  findParentPageId: async ({ planName }) => {
    try {
      const response = await db.notion.databases.query({
        database_id: databaseId,
        filter: {
          property: "事項",
          title: {
            equals: planName,
          },
        },
      })

      if (response.results.length > 0) {
        return response.results[0].id
      } else {
        throw new Error(`找不到 ${planName} 頁面`)
      }
    } catch (error) {
      console.error("查詢父頁面ID時發生錯誤:", error)
      throw error
    }
  },
  addItemsToDatabase: async ({ data, parentPageId }) => {
    const promises = data.map(async (item) => {
      try {
        const pageData = {
          parent: { database_id: databaseId },
          properties: {
            Status: {
              status: { name: calculateStatus(item.record) },
            },
            事項: {
              title: [
                {
                  type: "text",
                  text: { content: item.timeline_title },
                },
              ],
            },
            URL: {
              url: item.link_url,
            },
            簡介: {
              rich_text: [
                {
                  type: "text",
                  text: { content: item.duration },
                },
              ],
            },
            "Plan/Task": {
              select: { name: "Task" },
            },
            領域: {
              multi_select: [{ name: "學習" }],
            },
            "Parent item": {
              relation: [{ id: parentPageId }],
            },
          },
        }

        try {
          const response = await db.notion.pages.create(pageData)
          return response
        } catch (error) {
          console.error("Error creating Notion page:", error)
          throw error
        }
      } catch (error) {
        console.error(`無法新增項目: ${item.timeline_title}`, error)
      }
    })

    await Promise.all(promises)
  },
  getAllPlans: async () => {
    try {
      const response = await db.notion.databases.query({
        database_id: databaseId,
        filter: {
          and: [
            {
              property: "Plan/Task",
              select: {
                equals: "Plan",
              },
            },
          ],
        },
      })

      if (response.results.length > 0) {
        return response.results.map((plan) => {
          const titleProperty = plan.properties["事項"]
          const title =
            titleProperty &&
            titleProperty.title &&
            titleProperty.title[0] &&
            titleProperty.title[0].text
              ? titleProperty.title[0].text.content
              : "無標題"
          return {
            name: title,
            id: plan.id,
          }
        })
      } else {
        throw new Error("找不到任何計劃")
      }
    } catch (error) {
      console.error("查詢所有計劃時發生錯誤:", error)
      throw error
    }
  },
}
