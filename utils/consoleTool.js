const fs = require("fs")
const path = require("path")

module.exports = {
  consoleDetail: (name, data, saveToFile = false, printOnConsole = true) => {
    if (printOnConsole) {
      console.log(name)
      console.dir(data, { depth: null })
    }

    if (saveToFile) {
      try {
        const filePath = path.join(process.cwd(), `./data/${name}.json`)
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")
        console.log(`console data saved to ${filePath}`)
      } catch (error) {
        console.error(`Failed to save data to file: ${error.message}`)
      }
    }
  },
}
