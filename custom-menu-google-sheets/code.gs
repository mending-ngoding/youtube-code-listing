const showDate = () => {
  const now = new Date
  const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

  const date = now.getDate()
  const month = monthList[now.getMonth()]
  const year = now.getFullYear()
  const dateString = `${date} ${month} ${year}`

  const message = `Sekarang tanggal ${dateString}`

  console.log(message)
  SpreadsheetApp.getUi().alert(message)
}


const showTime = () => {
  const now = new Date

  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const timeString = `${hours}.${minutes}`

  const message = `Sekarang pukul ${timeString}`

  console.log(message)
  SpreadsheetApp.getUi().alert(message)
}


const showActiveRange = () => {
  const activeRange = SpreadsheetApp.getActiveRange()
  
  const sheetName = activeRange.getSheet().getName()
  const cell = activeRange.getA1Notation()

  const message = `Sel yang aktif adalah ${cell} pada sheet ${sheetName}`
  SpreadsheetApp.getUi().alert(message)
}


const onOpen = () => {
  const ui = SpreadsheetApp.getUi()

  ui.createMenu('Custom Menu Saya')
    .addItem('Tampilkan Tanggal', 'showDate')
    .addItem('Tampilkan Waktu', 'showTime')
    .addSeparator()
    .addSubMenu(
      ui.createMenu('Submenu Saya')
        .addItem('Tampilkan Active Range', 'showActiveRange')
    )
    .addToUi()
}

