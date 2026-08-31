// ======================================================
// DATASOURCESHEETS.JS
// Acceso técnico centralizado a Google Sheets.
// ======================================================
class DataSourceSheets {
  static obtenerSpreadsheet(){ return SpreadsheetApp.getActiveSpreadsheet(); }
  static obtenerHoja(nombre){ const h=this.obtenerSpreadsheet().getSheetByName(nombre); if(!h) throw new Error(`No existe la hoja: ${nombre}`); return h; }
  static asegurarHoja(nombre,headers){ const ss=this.obtenerSpreadsheet(); let h=ss.getSheetByName(nombre); if(!h) h=ss.insertSheet(nombre); if(h.getLastRow()===0) h.getRange(1,1,1,headers.length).setValues([headers]); return h; }
}
