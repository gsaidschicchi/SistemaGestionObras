// ======================================================
// DAL_PERMISO.JS
// Lectura física de permisos configurables por rol/módulo.
// Resuelve columnas por encabezado; no decide autorización.
// ======================================================
class DAL_Permiso {
  static _normalizar(v) { return String(v == null ? "" : v).trim(); }

  static listar(nombreHoja = Config.HOJAS.PERMISOS) {
    const h = DataSourceSheets.obtenerHoja(nombreHoja);
    const lastRow = h.getLastRow();
    const lastCol = h.getLastColumn();
    if (lastRow < 2 || lastCol < 1) return [];

    const headers = h.getRange(1, 1, 1, lastCol).getDisplayValues()[0].map(x => this._normalizar(x).toUpperCase());
    const idx = {};
    Config.HEADERS.PERMISOS.forEach(nombre => {
      const pos = headers.indexOf(nombre);
      if (pos < 0) throw new Error(`Falta el encabezado ${nombre} en ${nombreHoja}.`);
      idx[nombre] = pos;
    });

    const rolesValidos = Object.keys(Config.ROLES).map(k => Config.ROLES[k]);
    const modulosValidos = Object.keys(Config.MODULOS).map(k => Config.MODULOS[k]);
    const salida = [];
    const filas = h.getRange(2, 1, lastRow - 1, lastCol).getDisplayValues();

    filas.forEach((f, i) => {
      if (!f.some(v => this._normalizar(v) !== "")) return;
      const item = {
        fila: i + 2,
        Rol: this._normalizar(f[idx.ROL]).toUpperCase(),
        Modulo: this._normalizar(f[idx.MODULO]).toUpperCase(),
        Permitido: this._normalizar(f[idx.PERMITIDO]).toUpperCase()
      };
      const valido = rolesValidos.includes(item.Rol) && (item.Modulo === "*" || modulosValidos.includes(item.Modulo)) && [Config.ACTIVO.SI, Config.ACTIVO.NO].includes(item.Permitido);
      if (!valido) {
        Logger.log(`[PERMISOS] Fila ${item.fila} inválida en ${nombreHoja}; se ignora.`);
        return;
      }
      salida.push(item);
    });
    return salida;
  }

  static listarPorRol(rol, nombreHoja = Config.HOJAS.PERMISOS) {
    const buscado = this._normalizar(rol).toUpperCase();
    return this.listar(nombreHoja).filter(x => x.Rol === buscado);
  }
}
