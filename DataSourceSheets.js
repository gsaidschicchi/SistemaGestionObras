// ======================================================
// DATASOURCESHEETS.JS
// Acceso técnico centralizado a Google Sheets.
// Reutiliza Spreadsheet/Sheet dentro de la ejecución.
// ======================================================
class DataSourceSheets {
  static obtenerSpreadsheet() {
    if (!this._spreadsheet) this._spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    return this._spreadsheet;
  }

  static obtenerHoja(nombre) {
    if (!this._hojas) this._hojas = {};
    if (!this._hojas[nombre]) {
      const h = this.obtenerSpreadsheet().getSheetByName(nombre);
      if (!h) throw new Error(`No existe la hoja: ${nombre}`);
      this._hojas[nombre] = h;
    }
    return this._hojas[nombre];
  }

  static asegurarHoja(nombre, headers) {
    const ss = this.obtenerSpreadsheet();
    let h = ss.getSheetByName(nombre);
    if (!h) h = ss.insertSheet(nombre);
    if (!this._hojas) this._hojas = {};
    this._hojas[nombre] = h;

    if (h.getLastRow() === 0) {
      h.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      const actuales = h.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
      const coincide = headers.every((x, i) => actuales[i] === x);
      if (!coincide) throw new Error(`Los encabezados de ${nombre} no coinciden con Config.HEADERS.`);
    }
    return h;
  }

  static formatearColumnaTexto(nombreHoja, columna) {
    const h = this.obtenerHoja(nombreHoja);
    h.getRange(1, columna, h.getMaxRows(), 1).setNumberFormat("@");
  }

  static formatearColumnaFechaHora(nombreHoja, columna) {
    const h = this.obtenerHoja(nombreHoja);
    h.getRange(2, columna, Math.max(h.getMaxRows() - 1, 1), 1).setNumberFormat("dd/MM/yyyy HH:mm:ss");
  }
}
