// kredensial
const formUrl        = 'https://docs.google.com/forms/d/1g7oeKNQHm5SgflRmcQKjqKGrICTKzUusP80JX8yQXPE/edit';
const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1tTv6zZhSKci-UANqigLnH8JurRWXo667opppKDVmkxA/edit?resourcekey#gid=2016791833';
const sheetName      = 'Form Responses 1';
const limit          = 3;

// fungsi utama
function main() {
  // akses sheet
  const spreadsheet    = SpreadsheetApp.openByUrl(spreadsheetUrl);
  const sheet          = spreadsheet.getSheetByName(sheetName);
  const lastRow        = sheet.getLastRow();
  const totalResponses = lastRow - 1;

  // akses form
  const form = FormApp.openByUrl(formUrl);

  Logger.log(totalResponses);

  const isFull = totalResponses >= limit;
  const shouldAcceptingResponses = !isFull;

  // atur form
  form.setAcceptingResponses(shouldAcceptingResponses);
}
