// ======================================================
// DAL_TAREA.JS
// Consulta Estado de Obra mediante índice y tabla reducida.
// Las hojas TEST_ continúan usando lectura directa para QA aislado.
// ======================================================
class DAL_Tarea {
  static listar(nombreHoja = Config.HOJAS.RAW_OBRAS) {
    if (nombreHoja !== Config.HOJAS.RAW_OBRAS) return this._listarDirecto(nombreHoja);
    const h = DataSourceSheets.obtenerHoja(Config.HOJAS.ESTADO_OBRAS_TAREAS);
    const lr = h.getLastRow();
    if (lr < 2) return [];
    const valores = h.getRange(2, 1, lr - 1, 6).getDisplayValues();
    return valores.map(f => new BE_Tarea(f[0],f[1],f[2],f[3],f[4],f[5])).filter(t => t.Ticket && t.Obra);
  }

  static listarPorObra(codigoObra, nombreHoja = Config.HOJAS.RAW_OBRAS) {
    if (nombreHoja !== Config.HOJAS.RAW_OBRAS) {
      const buscada = this._normalizarObra(codigoObra);
      return this._listarDirecto(nombreHoja).filter(t => this._normalizarObra(t.Obra) === buscada);
    }

    const entrada = this._buscarEntradaIndiceExacta(codigoObra);
    if (!entrada) return [];
    const h = DataSourceSheets.obtenerHoja(Config.HOJAS.ESTADO_OBRAS_TAREAS);
    const filas = h.getRange(entrada.filaInicio, 1, entrada.cantidad, 6).getDisplayValues();
    return filas.map(f => new BE_Tarea(f[0],f[1],f[2],f[3],f[4],f[5])).filter(t => t.Ticket && t.Obra);
  }

  static buscarObras(texto, nombreHoja = Config.HOJAS.RAW_OBRAS) {
    if (nombreHoja !== Config.HOJAS.RAW_OBRAS) {
      const buscada = this._normalizarObra(texto);
      const unicas = {};
      this._listarDirecto(nombreHoja).forEach(t => {
        if (this._normalizarObra(t.Obra).indexOf(buscada) === 0) unicas[t.Obra] = true;
      });
      return Object.keys(unicas).sort();
    }

    const buscada = this._normalizarObra(texto);
    if (!buscada) return [];
    const h = DataSourceSheets.obtenerHoja(Config.HOJAS.ESTADO_OBRAS_INDICE);
    const lr = h.getLastRow();
    if (lr < 2) return [];
    return h.getRange(2, 1, lr - 1, 2).getDisplayValues()
      .filter(f => String(f[1] || "").indexOf(buscada) === 0)
      .map(f => String(f[0] || "").trim())
      .filter(Boolean)
      .sort();
  }

  static _buscarEntradaIndiceExacta(codigoObra) {
    const buscada = this._normalizarObra(codigoObra);
    if (!buscada) return null;
    const h = DataSourceSheets.obtenerHoja(Config.HOJAS.ESTADO_OBRAS_INDICE);
    const lr = h.getLastRow();
    if (lr < 2) return null;
    const filas = h.getRange(2, 1, lr - 1, 5).getDisplayValues();
    for (let i = 0; i < filas.length; i++) {
      if (String(filas[i][1] || "") === buscada) {
        return { obra: filas[i][0], filaInicio: Number(filas[i][2]), cantidad: Number(filas[i][3]), ultimaEC: filas[i][4] };
      }
    }
    return null;
  }

  static _listarDirecto(nombreHoja) {
    const h = DataSourceSheets.obtenerHoja(nombreHoja);
    const lr = h.getLastRow();
    const lc = h.getLastColumn();
    if (lr < 2 || lc < 1) return [];
    const headers = h.getRange(1,1,1,lc).getDisplayValues()[0].map(x => String(x || "").trim());
    const idx = this._indices(headers);
    const filas = h.getRange(2,1,lr-1,lc).getDisplayValues();
    return filas.map(f => MAP_Tarea.FilaABE(f, idx)).filter(t => t.Ticket && t.Obra);
  }

  static _indices(encabezados) {
    const buscar = nombre => encabezados.indexOf(nombre);
    const indices = {
      ticket: buscar("Tareas_Ticket"), obra: buscar("Moica Obra"), estadoEC: buscar("Tareas_Estado"),
      estadoSupervision: buscar("Estado Supervisión"), estadoMateriales: buscar("Estado Materiales"), ultimaEC: buscar("Última EC")
    };
    ["ticket","obra","estadoEC","estadoSupervision","estadoMateriales"].forEach(k => {
      if (indices[k] < 0) throw new Error(`Falta encabezado requerido del consolidado: ${this._nombreHeader(k)}`);
    });
    return indices;
  }

  static _nombreHeader(k) {
    return {ticket:"Tareas_Ticket",obra:"Moica Obra",estadoEC:"Tareas_Estado",estadoSupervision:"Estado Supervisión",estadoMateriales:"Estado Materiales"}[k];
  }

  static _normalizarObra(v) {
    return String(v || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  }
}
