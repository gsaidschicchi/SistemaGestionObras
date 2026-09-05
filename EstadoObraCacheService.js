// ======================================================
// ESTADOOBRACACHESERVICE.JS
// Construye un índice de obras y una tabla reducida de tareas.
// El costo pesado ocurre al actualizar la fuente, no en Telegram.
// ======================================================
class EstadoObraCacheService {
  static reconstruir() {
    const ss = DataSourceSheets.obtenerSpreadsheet();
    const raw = ss.getSheetByName(Config.HOJAS.RAW_OBRAS);
    if (!raw || raw.getLastRow() < 2) throw new Error("RAW_OBRAS no contiene datos para construir el cache.");

    const lr = raw.getLastRow();
    const lc = raw.getLastColumn();
    const headers = raw.getRange(1, 1, 1, lc).getDisplayValues()[0].map(x => String(x || "").trim());
    const idx = this._indices(headers);
    const n = lr - 1;
    const leer = i => raw.getRange(2, i + 1, n, 1).getDisplayValues().flat();

    const c = {
      ticket: leer(idx.ticket),
      obra: leer(idx.obra),
      estadoEC: leer(idx.estadoEC),
      estadoSupervision: leer(idx.estadoSupervision),
      estadoMateriales: leer(idx.estadoMateriales),
      ultimaEC: leer(idx.ultimaEC)
    };

    const grupos = {};
    for (let i = 0; i < n; i++) {
      const ticket = String(c.ticket[i] || "").trim();
      const obra = String(c.obra[i] || "").trim();
      if (!ticket || !obra) continue;
      const norm = this._normalizarObra(obra);
      if (!norm) continue;
      if (!grupos[norm]) grupos[norm] = { obra, ultimaEC: "", tareas: [] };
      const ec = String(c.ultimaEC[i] || "").trim();
      if (ec && !grupos[norm].ultimaEC) grupos[norm].ultimaEC = ec;
      grupos[norm].tareas.push([
        ticket,
        obra,
        String(c.estadoEC[i] || "").trim(),
        String(c.estadoSupervision[i] || "").trim(),
        String(c.estadoMateriales[i] || "").trim(),
        ec
      ]);
    }

    const normas = Object.keys(grupos).sort();
    const filasTareas = [["Tareas_Ticket","Moica Obra","Tareas_Estado","Estado Supervisión","Estado Materiales","Última EC"]];
    const filasIndice = [["OBRA","OBRA_NORM","FILA_INICIO","CANTIDAD","ULTIMA_EC"]];
    let filaInicio = 2;

    normas.forEach(norm => {
      const g = grupos[norm];
      filasIndice.push([g.obra, norm, filaInicio, g.tareas.length, g.ultimaEC]);
      g.tareas.forEach(f => filasTareas.push(f));
      filaInicio += g.tareas.length;
    });

    const hTareas = this._asegurarHoja(Config.HOJAS.ESTADO_OBRAS_TAREAS);
    const hIndice = this._asegurarHoja(Config.HOJAS.ESTADO_OBRAS_INDICE);
    hTareas.clearContents();
    hIndice.clearContents();
    hTareas.getRange(1, 1, filasTareas.length, filasTareas[0].length).setValues(filasTareas);
    hIndice.getRange(1, 1, filasIndice.length, filasIndice[0].length).setValues(filasIndice);
    hTareas.setFrozenRows(1);
    hIndice.setFrozenRows(1);
    SpreadsheetApp.flush();

    return { obras: normas.length, tareas: filasTareas.length - 1 };
  }

  static esValido() {
    const ss = DataSourceSheets.obtenerSpreadsheet();
    const t = ss.getSheetByName(Config.HOJAS.ESTADO_OBRAS_TAREAS);
    const i = ss.getSheetByName(Config.HOJAS.ESTADO_OBRAS_INDICE);
    if (!t || !i || t.getLastRow() < 2 || i.getLastRow() < 2) return false;
    const ht = t.getRange(1,1,1,t.getLastColumn()).getDisplayValues()[0];
    const hi = i.getRange(1,1,1,i.getLastColumn()).getDisplayValues()[0];
    return ["Tareas_Ticket","Moica Obra","Tareas_Estado","Estado Supervisión","Estado Materiales","Última EC"].every(x => ht.indexOf(x) >= 0)
      && ["OBRA","OBRA_NORM","FILA_INICIO","CANTIDAD","ULTIMA_EC"].every(x => hi.indexOf(x) >= 0);
  }

  static _asegurarHoja(nombre) {
    const ss = DataSourceSheets.obtenerSpreadsheet();
    let h = ss.getSheetByName(nombre);
    if (!h) h = ss.insertSheet(nombre);
    if (!DataSourceSheets._hojas) DataSourceSheets._hojas = {};
    DataSourceSheets._hojas[nombre] = h;
    return h;
  }

  static _indices(headers) {
    const pos = n => headers.indexOf(n);
    const r = {
      ticket: pos("Tareas_Ticket"), obra: pos("Moica Obra"), estadoEC: pos("Tareas_Estado"),
      estadoSupervision: pos("Estado Supervisión"), estadoMateriales: pos("Estado Materiales"), ultimaEC: pos("Última EC")
    };
    Object.keys(r).forEach(k => { if (r[k] < 0) throw new Error(`Falta encabezado requerido para cache: ${k}`); });
    return r;
  }

  static _normalizarObra(v) {
    return String(v || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  }
}

function reconstruirCacheEstadoObra() {
  const r = EstadoObraCacheService.reconstruir();
  Logger.log(JSON.stringify(r));
  return r;
}
