function salinFile(tanggalTerbit) {
  const namaFileSalinan = `Sertifikat Seminar ${tanggalTerbit}`;

  // buka file blanko
  const file = DriveApp.getFileById(env('idSlideBlanko'));

  // salin file blanko
  const idSlideSalinan = file.makeCopy(namaFileSalinan).getId();

  return idSlideSalinan;
}


function editFile(idSlideSalinan, namaPeserta) {
  // buka file salinan, lihat shapes yang ada
  const slides = SlidesApp.openById(idSlideSalinan);
  const slide  = slides.getSlides()[0];
  const shapes = slide.getShapes();

  // edit teks
  shapes.forEach(shape => {
    shape.getText().replaceAllText('<nama_peserta>', namaPeserta);
  });

  // simpan file
  slides.saveAndClose();
}


function eksporFile(idSlideSalinan, tanggalTerbit) {
  // nama file
  const namaFile = `Sertifikat Seminar ${tanggalTerbit}.pdf`;

  // jadikan pdf dan ubah nama file
  const pdf = DriveApp.getFileById(idSlideSalinan).getBlob().getAs('application/pdf');
  pdf.setName(namaFile);

  // pindah file pdf ke folder ekspor
  const sertifikatPdf = DriveApp.getFolderById(env('idFolder')).createFile(pdf);
  const idSertifikatPdf = sertifikatPdf.getId();

  return idSertifikatPdf;
}


function ambilUrlPdf(idSertifikatPdf) {
  // buka file pdf
  const sertifikatPdf = DriveApp.getFileById(idSertifikatPdf);

  // ubah permission file pdf
  sertifikatPdf.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // ambil url
  const urlSertifikatPdf = sertifikatPdf.getUrl();

  return urlSertifikatPdf;
}


function hapusFileSalinan(idSlideSalinan) {
  // hapus slides salinan
  DriveApp.getFileById(idSlideSalinan).setTrashed(true);
}


function tulisPesan(namaPeserta, urlSertifikatPdf) {
  const pesan = `*SERTIFIKAT KEHADIRAN SEMINAR*

Bismillah.

Berikut kami kirimkan link download sertifikat kehadiran seminar untuk:

${namaPeserta}

Harap segera didownload, maksimal 3 hari setelah acara berakhir.

Terima kasih.

*Link Download:*
${urlSertifikatPdf}

Catatan:
Jika link di atas tidak bisa diklik, silakan simpan nomor ini sebagai kontak, atau balas pesan ini dengan jawaban sembarang, misal: "OK"`;

  return pesan;
}


function kirimWa(nomor, pesan) {
  const headers = {
    'Authorization': env('wablasToken'),
    'content-type' : 'application/json'
  };

  const payload = JSON.stringify(
    {
      'data':
      [{
        'phone' : nomor,
        'message': pesan,
        'secret': false,
        'retry': false,
        'isGroup': false
      }]
    }
  );
  
  const option = {
    'method': 'POST',
    'headers': headers,
    'payload': payload
  };

  const response = UrlFetchApp.fetch(env('wablasUrl'), option);
  const responseJson = JSON.parse(response.getContentText());

  Logger.log(responseJson);

  return responseJson['message'];
}


function bacaForm(e) {
  // baca inputan form
  const namaPeserta = e.namedValues['Nama Peserta'][0].trim();
  const noWaPeserta = e.namedValues['No. WhatsApp'][0].trim();

  // tanggal dan waktu
  const now = new Date;
  const tanggalTerbit = `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}_${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}`;

  // proses
  const idSlideSalinan = salinFile(tanggalTerbit);
  editFile(idSlideSalinan, namaPeserta);
  const idSertifikatPdf = eksporFile(idSlideSalinan, tanggalTerbit);
  const urlSertifikatPdf = ambilUrlPdf(idSertifikatPdf);
  hapusFileSalinan(idSlideSalinan);

  // kirim wa
  const pesan = tulisPesan(namaPeserta, urlSertifikatPdf);
  const report = kirimWa(noWaPeserta, pesan);

  // buka sheet
  const spreadsheet = SpreadsheetApp.openById(env('idSheet'));
  const sheet = spreadsheet.getSheetByName('Form Responses 1');
  const lastRow = sheet.getLastRow();

  // tulis link pdf
  sheet.getRange(`E${lastRow}`).setValue(urlSertifikatPdf);

  // tulis hasil pengiriman
  sheet.getRange(`F${lastRow}`).setValue(report);
}
