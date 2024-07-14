// index
const { notion, databaseId } = require("./config/config")
const app = require("./services/notionService")

app({ notion, databaseId }).catch(console.error)
