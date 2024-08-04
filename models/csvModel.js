const fs = require("fs")
const path = require("path")
const fastCSV = require("fast-csv")
const XLSX = require("xlsx")

const dataDir = path.resolve(__dirname, "../data")

function writeCSV(data, filePath) {
  const ws = fs.createWriteStream(filePath)
  fastCSV
    .write(data, { headers: true })
    .pipe(ws)
    .on("finish", () => {
      console.log("CSV 檔案寫入完成:", filePath)
    })
    .on("error", (error) => {
      console.error("寫入 CSV 檔案時發生錯誤：", error.message)
    })
}

function writeExcel(data, filePath) {
  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
  XLSX.writeFile(workbook, filePath)
  console.log("Excel 檔案寫入完成:", filePath)
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
    const csvData = []

    const csvStream = fastCSV
      .parse()
      .on("data", (data) => {
        csvData.push(data)
      })
      .on("end", () => {
        resolve(csvData)
      })
      .on("error", (error) => {
        reject(new Error(`讀取 CSV 檔案時發生錯誤：${error.message}`))
      })

    stream.pipe(csvStream)
  })
}

function readExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    return excelData
  } catch (error) {
    console.error("讀取 Excel 檔案時發生錯誤：", error.message)
  }
}

module.exports = {
  readData: async function (callback) {
    try {
      const files = await fs.promises.readdir(dataDir)
      let fileProcessed = false

      for (const file of files) {
        if (fileProcessed) break

        const filePath = path.join(dataDir, file)
        const ext = path.extname(file).toLowerCase()

        if (ext === ".csv") {
          fileProcessed = true
          const csvData = await readCSV(filePath)
          if (callback) callback(csvData)
          return csvData
        } else if (ext === ".xlsx") {
          fileProcessed = true
          const excelData = readExcel(filePath)
          if (callback) callback(excelData)
          return excelData
        }
      }
    } catch (error) {
      console.error("解析 CSV/XLSX 失敗", error)
    }
  },
  writeData: function (data, outputFileName) {
    const ext = path.extname(outputFileName).toLowerCase()
    const filePath = path.join(dataDir, outputFileName)

    if (ext === ".csv") {
      writeCSV(data, filePath)
    } else if (ext === ".xlsx") {
      writeExcel(data, filePath)
    } else {
      console.error("不支援的檔案格式")
    }
  },
}
