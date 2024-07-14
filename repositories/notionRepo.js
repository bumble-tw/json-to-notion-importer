module.exports = function ({ notion, databaseId }) {
  const findParentPageId = async ({ PlanName }) => {
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          property: "事項",
          title: {
            equals: PlanName,
          },
        },
      })

      if (response.results.length > 0) {
        return response.results[0].id
      } else {
        throw new Error(`找不到 ${PlanName} 頁面`)
      }
    } catch (error) {
      console.error("查詢父頁面ID時發生錯誤:", error)
      throw error
    }
  }

  const addItemsToDatabase = async ({ data, parentPageId }) => {
    const promises = data.map(async (item) => {
      try {
        await notion.pages.create({
          parent: { database_id: databaseId },
          properties: {
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
        })
        console.log(`成功新增項目: ${item.timeline_title}`)
      } catch (error) {
        console.error(`無法新增項目: ${item.timeline_title}`, error)
      }
    })

    await Promise.all(promises)
  }

  return {
    findParentPageId,
    addItemsToDatabase,
  }
}
