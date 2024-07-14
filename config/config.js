const { Client } = require("@notionhq/client")

const databaseId = process.env.DATABASE_ID
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

module.exports = { notion, databaseId }
