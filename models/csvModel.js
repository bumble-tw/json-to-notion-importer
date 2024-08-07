const fs = require("fs")
const path = require("path")
const fastCSV = require("fast-csv")
const XLSX = require("xlsx")
const dataDir = path.resolve(__dirname, "../data")

function readExistingData(dataDir) {
  const files = fs.readdirSync(dataDir)
  const validFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase()
    return ext === ".csv" || ext === ".xlsx"
  })

  if (validFiles.length === 0) {
    console.error("data資料夾中，找不到CSV或XLSX檔案")
    return
  }

  if (validFiles.length > 1) {
    console.error("data資料夾中，只能有一個CSV或XLSX檔案")
    return
  }

  const filePath = path.join(dataDir, validFiles[0])
  const ext = path.extname(validFiles[0]).toLowerCase()

  return { filePath, ext }
}

function writeCSV(data, filePath) {
  const ws = fs.createWriteStream(filePath, { encoding: "utf8" })
  ws.write("\ufeff") // 在文件的開頭寫入 UTF-8 BOM
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

function writeCSVCell(data, filePath, columnName, rowIndex) {
  const headers = []
  const csvData = []

  fs.createReadStream(filePath, { encoding: "utf-8" }) // 確保使用 UTF-8 編碼
    .pipe(fastCSV.parse({ headers: true }))
    .on("data", (row) => {
      if (headers.length === 0) {
        headers.push(...Object.keys(row))
      }
      csvData.push(row)
    })
    .on("end", () => {
      const colIndex = headers.indexOf(columnName)
      if (colIndex === -1) {
        console.error(`欄位名稱 ${columnName} 不存在於 CSV 檔案中`)
        return
      }

      if (!csvData[rowIndex]) {
        csvData[rowIndex] = {}
      }
      csvData[rowIndex][columnName] = data

      writeCSV(csvData, filePath)
    })
    .on("error", (error) => {
      console.error("讀取 CSV 檔案時發生錯誤：", error.message)
    })
}

function writeExcelCell(data, filePath, sheetName, columnName, rowIndex) {
  const workbook = fs.existsSync(filePath)
    ? XLSX.readFile(filePath)
    : XLSX.utils.book_new()
  const worksheet = workbook.Sheets[sheetName] || XLSX.utils.aoa_to_sheet([])
  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] || []
  const colIndex = headers.indexOf(columnName)

  if (colIndex === -1) {
    console.error(`欄位名稱 ${columnName} 不存在於工作表中`)
    return
  }

  const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex })
  worksheet[cellAddress] = { v: data }

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filePath)
  console.log(
    `資料已寫入 ${sheetName} 工作表的 ${columnName}${rowIndex + 1} 儲存格中`
  )
}

module.exports = {
  readData: async function (callback) {
    try {
      const { filePath, ext } = readExistingData(dataDir)
      if (ext === ".csv") {
        const csvData = await readCSV(filePath)
        if (callback) callback(csvData)
        return csvData
      } else if (ext === ".xlsx") {
        const excelData = readExcel(filePath)
        if (callback) callback(excelData)
        return excelData
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
  writeToCell: function (data, columnName, rowIndex, sheetName) {
    const { filePath, ext } = readExistingData(dataDir)

    if (ext === ".csv") {
      writeCSVCell(data, filePath, columnName, rowIndex)
    } else if (ext === ".xlsx") {
      writeExcelCell(
        data,
        filePath,
        sheetName || "Sheet1",
        columnName,
        rowIndex
      )
    } else {
      console.error("不支援的檔案格式")
    }
  },
}
