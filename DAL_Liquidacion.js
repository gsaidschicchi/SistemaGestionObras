// ======================================================
// DAL_LIQUIDACION.JS
// Lectura opcional de estado de liquidación desde hoja LIQUIDACION_OBRAS.
// Si la fuente aún no existe, devuelve null sin inventar información.
// ======================================================
class DAL_Liquidacion {
  static buscarPorObra(codigoObra) {
    const ss = DataSourceSheets.obtenerSpreadsheet();
    const h = ss.getSheetByName(Config.HOJAS.LIQUIDACION_OBRAS);
    if (!h || h.getLastRow() < 2) return null;
    const lc = h.getLastColumn();
    const headers = h.getRange(1,1,1,lc).getDisplayValues()[0].map(x=>String(x||"").trim());
    const idxObra = headers.indexOf("Moica Obra");
    const idxLiquidable = headers.indexOf("Moica Liquidable");
    const idxMes = headers.indexOf("Mes");
    const idxQna = headers.indexOf("Quincena");
    if (idxObra < 0 || idxLiquidable < 0) return null;
    const buscada = this._nObra(codigoObra);
    const rows = h.getRange(2,1,h.getLastRow()-1,lc).getDisplayValues();
    const fila = rows.find(f => this._nObra(f[idxObra]) === buscada);
    if (!fila) return null;
    return { liquidable: String(fila[idxLiquidable]||"").trim(), mes: idxMes >= 0 ? String(fila[idxMes]||"").trim() : "", quincena: idxQna >= 0 ? String(fila[idxQna]||"").trim() : "" };
  }
  static _nObra(v){ return String(v||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,""); }
}
