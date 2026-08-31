// ======================================================
// DATASOURCESHEETS.GS
// Centraliza el acceso técnico al Google Spreadsheet.
// Permite que los DAL trabajen con las hojas sin conocer
// cómo se obtiene físicamente el archivo.
// ======================================================

class DataSourceSheets {

  // Devuelve el Spreadsheet asociado a este proyecto.
  static obtenerSpreadsheet() {
    return SpreadsheetApp.getActiveSpreadsheet();
  }


  // Devuelve una hoja según su nombre.
  // Si no existe, genera un error técnico.
  static obtenerHoja(nombreHoja) {

    const spreadsheet = this.obtenerSpreadsheet();
    const hoja = spreadsheet.getSheetByName(nombreHoja);

    if (!hoja) {
      throw new Error(`No existe la hoja: ${nombreHoja}`);
    }

    return hoja;
  }

}