// ======================================================
// DAL_ROL.JS
// Lectura física del catálogo dinámico de roles.
// Resuelve columnas por encabezado y no aplica reglas de negocio.
// ======================================================
class DAL_Rol {
  static _normalizar(v) { return String(v == null ? "" : v).trim(); }

  static listar(nombreHoja = Config.HOJAS.ROLES) {
    const h = DataSourceSheets.obtenerHoja(nombreHoja);
    const lastRow = h.getLastRow();
    const lastCol = h.getLastColumn();
    if (lastRow < 2 || lastCol < 1) return [];

    const headers = h.getRange(1, 1, 1, lastCol).getDisplayValues()[0].map(x => this._normalizar(x).toUpperCase());
    const idx = {};
    Config.HEADERS.ROLES.forEach(nombre => {
      const pos = headers.indexOf(nombre);
      if (pos < 0) throw new Error(`Falta el encabezado ${nombre} en ${nombreHoja}.`);
      idx[nombre] = pos;
    });

    const salida = [];
    const filas = h.getRange(2, 1, lastRow - 1, lastCol).getDisplayValues();
    filas.forEach((f, i) => {
      if (!f.some(v => this._normalizar(v) !== "")) return;
      const item = {
        fila: i + 2,
        Rol: this._normalizar(f[idx.ROL]).toUpperCase(),
        Descripcion: this._normalizar(f[idx.DESCRIPCION]),
        Activo: this._normalizar(f[idx.ACTIVO]).toUpperCase(),
        PrefijoCod: this._normalizar(f[idx.PREFIJO_COD]).toUpperCase()
      };
      const valido = item.Rol && item.Descripcion && [Config.ACTIVO.SI, Config.ACTIVO.NO].includes(item.Activo) && /^[A-Z0-9]{3}$/.test(item.PrefijoCod);
      if (!valido) {
        Logger.log(`[ROLES] Fila ${item.fila} inválida en ${nombreHoja}; se ignora.`);
        return;
      }
      salida.push(item);
    });
    return salida;
  }

  static listarActivos(nombreHoja = Config.HOJAS.ROLES) {
    return this.listar(nombreHoja).filter(x => x.Activo === Config.ACTIVO.SI);
  }

  static buscarPorRol(rol, nombreHoja = Config.HOJAS.ROLES) {
    const buscado = this._normalizar(rol).toUpperCase();
    return this.listar(nombreHoja).find(x => x.Rol === buscado) || null;
  }
}
