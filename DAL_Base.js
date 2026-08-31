// ======================================================
// DAL_BASE.GS
// Operaciones comunes de persistencia sobre Sheets.
// ======================================================
class DAL_Base {
  static filas(nombreHoja, columnas) {
    const h = DataSourceSheets.obtenerHoja(nombreHoja);
    const lr = h.getLastRow();
    return lr < 2 ? [] : h.getRange(2, 1, lr - 1, columnas).getValues();
  }

  static insertar(nombreHoja, fila) {
    const h = DataSourceSheets.obtenerHoja(nombreHoja);
    const nroFila = h.getLastRow() + 1;
    h.getRange(nroFila, 1, 1, fila.length).setValues([fila]);
    return nroFila;
  }

  static actualizar(nombreHoja, nroFila, fila) {
    DataSourceSheets.obtenerHoja(nombreHoja).getRange(nroFila, 1, 1, fila.length).setValues([fila]);
  }

  static buscarPrimero(nombreHoja, columnas, pred) {
    const d = this.filas(nombreHoja, columnas);
    for (let i = 0; i < d.length; i++) {
      if (pred(d[i])) return { fila: i + 2, datos: d[i] };
    }
    return null;
  }

  static buscarTodos(nombreHoja, columnas, pred) {
    return this.filas(nombreHoja, columnas)
      .map((x, i) => ({ fila: i + 2, datos: x }))
      .filter(x => pred(x.datos));
  }
}
