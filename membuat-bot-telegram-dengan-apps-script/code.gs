// kredensial
const spreadsheetId      = '1iwU6Z8igNSklY_nP3XFsn2kfesZFRpJuCptNJ18OaNY'
const dataOrderSheetName = 'Data Order'
const logSheetName       = 'Log'

const botHandle      = '@MendingStoreBot'
const botToken       = '6897961559:AAFl5Q8ILsZSMX1V0QsRzJpAih4W0NRBw8k'
const appsScriptUrl  = 'https://script.google.com/macros/s/AKfycbwfZ_1onptD0Badw6KzRCLcVP9lm1WRMU_ASuRvRBWWW8SY8KDE4aziDL6L4ka5tmk2AA/exec'
const telegramApiUrl = `https://api.telegram.org/bot${botToken}`


function log(logMessage = '') {
  // akses sheet
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
  const sheet       = spreadsheet.getSheetByName(logSheetName)
  const lastRow     = sheet.getLastRow()
  const row         = lastRow + 1

  // inisiasi nilai
  const today = new Date

  // insert row kosong
  sheet.insertRowAfter(lastRow)

  // insert data
  sheet.getRange(`A${row}`).setValue(today)
  sheet.getRange(`B${row}`).setValue(logMessage)
}


function formatDate(date) {
  const monthIndoList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

  const dateIndo  = date.getDate()
  const monthIndo = monthIndoList[date.getMonth()]
  const yearIndo  = date.getFullYear()

  const result = `${dateIndo} ${monthIndo} ${yearIndo}`

  return result
}


function sendTelegramMessage(chatId, replyToMessageId, textMessage) {
  // url kirim pesan
  const url = `${telegramApiUrl}/sendMessage`;
  
  // payload
  const data = {
    parse_mode              : 'HTML',
    chat_id                 : chatId,
    reply_to_message_id     : replyToMessageId,
    text                    : textMessage,
    disable_web_page_preview: true,
  }
  
  const options = {
    method     : 'post',
    contentType: 'application/json',
    payload    : JSON.stringify(data)
  }

  const response = UrlFetchApp.fetch(url, options).getContentText()
  return response;
}


function parseMessage(message = '') {
  // pisahkan berdasarkan karakter enter
  const splitted = message.split('\n')

  // inisiasi variabel
  let nama       = ''
  let kodeBarang = ''
  let alamat     = ''
  let resi       = ''

  // parsing pesan untuk mencari nilai variabel
  splitted.forEach(el => {
    nama = el.includes('Nama:') ? el.split(':')[1].trim().replaceAll('\n', ' ') : nama;
    kodeBarang = el.includes('Kode Barang:') ? el.split(':')[1].trim().replaceAll('\n', ' ') : kodeBarang;
    alamat = el.includes('Alamat:') ? el.split(':')[1].trim().replaceAll('\n', ' ') : alamat;
    resi = el.includes('Resi:') ? el.split(':')[1].trim().replaceAll('\n', ' ') : resi;
  })

  // kumpulkan hasil
  const result = {
    nama      : nama,
    kodeBarang: kodeBarang,
    alamat    : alamat,
    resi      : resi,
  }

  // jika data kosong
  const isEmpty = (nama === '' && kodeBarang === '' && alamat === '' && resi === '')

  return isEmpty ? false : result
}


function inputDataOrder(data) {
  try {
    // akses sheet
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
    const sheet = spreadsheet.getSheetByName(dataOrderSheetName)
    const lastRow = sheet.getLastRow()
    const row = lastRow + 1

    // inisiasi nilai
    const number  = lastRow
    const idOrder = `ORD-${number}`
    const today   = new Date

    // insert row kosong
    sheet.insertRowAfter(lastRow)

    // insert data
    sheet.getRange(`A${row}`).setValue(number)
    sheet.getRange(`B${row}`).setValue(idOrder)
    sheet.getRange(`C${row}`).setValue(today)
    sheet.getRange(`D${row}`).setValue(data['nama'])
    sheet.getRange(`E${row}`).setValue(data['kodeBarang'])
    sheet.getRange(`F${row}`).setValue(data['alamat'])
    sheet.getRange(`G${row}`).setValue(data['resi'])
    sheet.getRange(`H${row}`).setValue('Sedang dikemas')
    sheet.getRange(`I${row}`).setValue(data['chatId'])

    // jika berhasil, return idOrder
    return idOrder

  } catch(err) {
    return false
  }
}


function cekResi(resi = null) {
  // cegah resi kosong
  if (!resi) {
    return 'Format pencarian resi tidak valid.'
  }

  // akses sheet
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
  const sheet       = spreadsheet.getSheetByName(dataOrderSheetName)
  const lastRow     = sheet.getLastRow()

  // ambil data
  const range    = `A2:I${lastRow}`
  const dataList = sheet.getRange(range).getValues()

  // filter data
  const dataListFiltered = dataList.filter(el => el[6].toString().toLowerCase() === resi.toString().toLowerCase())

  // cek jika resi ditemukan  
  const isResiFound = dataListFiltered.length > 0

  // variabel balasan
  let messageReply = ''

  // jika ditemukan
  if (isResiFound) {
		// jika ada no resi yang sama, yang diambil yang paling atas
    const data = dataListFiltered[0]

    messageReply = `Info Resi <b>${resi}</b>

ID Order: ${data[1]}
Tanggal Order: ${formatDate(data[2])}
Nama: ${data[3]}
Kode Barang: ${data[4]}
Alamat: ${data[5]}
Status Pengiriman: <b>${data[7]}</b>`
  
  // jika tidak
  } else {
    messageReply = `Resi ${resi} tidak ditemukan.`
  }

  return messageReply
}


function handleUpdateDeliveryStatus(e) {
  // ambil info sheet dan row yang baru diedit
	const row       = e.range.getRow()
  const column    = e.range.getA1Notation().replace(/[^a-zA-Z]/g, '')
  const sheetName = e.range.getSheet().getSheetName()

	// jika perubahan bukan pada sheet data order kolom H
  if (sheetName !== dataOrderSheetName || column !== 'H') {
    return false
  }

  // akses sheet
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
  const sheet       = spreadsheet.getSheetByName(dataOrderSheetName)
  const today       = new Date

  // ambil data
  const range = `A${row}:I${row}`
  const data  = sheet.getRange(range).getValues()

  // isi konstanta
  const idOrder          = data[0][1]
  const tanggalOrder     = data[0][2]
  const nama             = data[0][3]
  const kodeBarang       = data[0][4]
  const alamat           = data[0][5]
  const resi             = data[0][6]
  const statusPengiriman = data[0][7]
  const chatId           = data[0][8].toString()

  const textMessage = `Update Info Resi <b>${resi}</b>

ID Order: ${idOrder}
Tanggal Order: ${formatDate(tanggalOrder)}
Nama: ${nama}
Kode Barang: ${kodeBarang}
Alamat: ${alamat}
Status Pengiriman: <b>${statusPengiriman}</b>

<i>Data per-${formatDate(today)}</i>`

  // kirim pesan
  sendTelegramMessage(chatId, null, textMessage)
}


function doPost(e) {
  try {
    // urai pesan masuk
    const contents            = JSON.parse(e.postData.contents)
    const chatId              = contents.message.chat.id
    const receivedTextMessage = contents.message.text.replace(botHandle, '').trim() // hapus botHandle jika pesan berasal dari grup
    const messageId           = contents.message.message_id

    let messageReply = ''

    // 1. jika pesan /start
    if (receivedTextMessage.toLowerCase() === '/start') {
      // tulis pesan balasan
      messageReply = `Halo! Status bot dalam keadaan aktif.`

    // 2. jika pesan diawali dengan /input
    } else if (receivedTextMessage.split('\n')[0].toLowerCase() === '/input') {
      const parsedMessage = parseMessage(receivedTextMessage)

      // 2a.jika ada data
      if (parsedMessage) {
        const data = {
          nama      : parsedMessage['nama'],
          kodeBarang: parsedMessage['kodeBarang'],
          alamat    : parsedMessage['alamat'],
          resi      : parsedMessage['resi'],
          chatId    : chatId
        }

        // insert data ke sheet
        const idOrder = inputDataOrder(data)

        // tulis pesan balasan
        messageReply = idOrder ? `Data berhasil disimpan dengan ID Order <b>${idOrder}</b>` : 'Data gagal disimpan'

      // 2b. jika tidak ada data
      } else {
        messageReply = 'Data kosong dan tidak dapat disimpan'
      }

    // 3. cek resi 
    } else if (receivedTextMessage.split(' ')[0].toLowerCase() === '/resi') {
      // ambil resi
      const resi = receivedTextMessage.split(' ')[1]

      // ambil info
      messageReply = cekResi(resi)

    // 4. format
    } else if (receivedTextMessage.toLowerCase() === '/format') {
      messageReply = `Untuk <b>input data order</b> gunakan format:

<pre>/input
Nama: 
Kode Barang: 
Alamat: 
Resi: </pre>

Untuk <b>cek resi</b> gunakan format:

<pre>/resi [nomor resi]</pre>
(Tanpa tanda kurung siku)`

    // 5. format salah
    } else {
      messageReply = `Pesan yang Anda kirim tidak sesuai format.

Kirim perintah /format untuk melihat daftar format pesan yang tersedia.`
    }

    // kirim pesan balasan
    sendTelegramMessage(chatId, messageId, messageReply)

  } catch(err) {
    log(err)
  }
}


function setWebhook() {
  // akses api
  const url      = `${telegramApiUrl}/setwebhook?url=${appsScriptUrl}`
  const response = UrlFetchApp.fetch(url).getContentText()
  
  Logger.log(response)
}


















