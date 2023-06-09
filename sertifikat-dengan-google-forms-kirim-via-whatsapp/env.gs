function env(name) {
  const props = {
    idSheet: 'ISI_ID_SPREADSHEET_ANDA',
    idSlideBlanko: 'ISI_ID_SLIDE_BLANKO_SERTIFIKAT_ANDA',
    idFolder: 'ISI_ID_FOLDER_EKSPOR_ANDA',
    wablasToken: 'ISI_API_KEY_WABLAS_ANDA',
    wablasUrl: 'https://pati.wablas.com/api/v2/send-message'
  }

  return props[name];
}
