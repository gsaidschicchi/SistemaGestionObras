// ======================================================
// CONSOLIDADOUPDATESERVICE.JS
// Actualización controlada de RAW_OBRAS desde Drive.
// Importa la última fuente disponible solo cuando cambió
// o cuando RAW_OBRAS todavía no contiene una base válida.
// ======================================================
class ConsolidadoUpdateService {
  static actualizarSiCorresponde() {
    const fuente = this._archivoMasReciente();
    const control = this._leerControl();
    const marcaFuente = fuente.getLastUpdated().getTime();
    const rawValida = this._rawValida();

    if (rawValida && control.marcaFuente && Number(control.marcaFuente) === marcaFuente) {
      if (!EstadoObraCacheService.esValido()) {
        const cache = EstadoObraCacheService.reconstruir();
        return {
          actualizado: false,
          motivo: "CACHE_RECONSTRUIDA",
          fechaDatos: control.fechaProceso || null,
          archivo: control.archivo || fuente.getName(),
          cache
        };
      }
      return {
        actualizado: false,
        motivo: "SIN_CAMBIOS",
        fechaDatos: control.fechaProceso || null,
        archivo: control.archivo || fuente.getName()
      };
    }

    this._importarFuente(fuente);
    const cache = EstadoObraCacheService.reconstruir();

    const ahora = new Date();
    this._guardarControl({
      marcaFuente,
      fechaProceso: ahora,
      archivo: fuente.getName()
    });

    return {
      actualizado: true,
      motivo: rawValida ? "FUENTE_ACTUALIZADA" : "BASE_INICIAL_CARGADA",
      fechaDatos: ahora,
      archivo: fuente.getName(),
      cache
    };
  }

  static obtenerInfoActualizacion() {
    const c = this._leerControl();
    return { fechaDatos: c.fechaProceso || null, archivo: c.archivo || "" };
  }

  static _archivoMasReciente() {
    const carpetas = DriveApp.getFoldersByName(Config.CONSOLIDADO.NOMBRE_CARPETA);
    if (!carpetas.hasNext()) throw new Error(`No encontré la carpeta: ${Config.CONSOLIDADO.NOMBRE_CARPETA}`);

    const archivos = carpetas.next().getFilesByType(MimeType.CSV);
    let elegido = null;
    let fecha = new Date(0);

    while (archivos.hasNext()) {
      const a = archivos.next();
      if (a.getLastUpdated() > fecha) {
        elegido = a;
        fecha = a.getLastUpdated();
      }
    }

    if (!elegido) throw new Error(`No encontré archivos CSV en ${Config.CONSOLIDADO.NOMBRE_CARPETA}`);
    return elegido;
  }

  static _importarFuente(fuente) {
    const contenido = fuente.getBlob().getDataAsString("UTF-16LE");
    const datos = Utilities.parseCsv(contenido, "\t");

    if (!datos || datos.length < 2) {
      throw new Error("El Consolidado por Tarea no contiene datos operativos.");
    }

    this._validarHeaders(datos[0]);

    const h = this._asegurarHojaRaw();
    h.clearContents();
    h.getRange(1, 1, datos.length, datos[0].length).setValues(datos);
    h.setFrozenRows(1);

    SpreadsheetApp.flush();
  }

  static _rawValida() {
    try {
      const ss = DataSourceSheets.obtenerSpreadsheet();
      const h = ss.getSheetByName(Config.HOJAS.RAW_OBRAS);
      if (!h || h.getLastRow() < 2 || h.getLastColumn() < 1) return false;

      const headers = h
        .getRange(1, 1, 1, h.getLastColumn())
        .getDisplayValues()[0]
        .map(x => String(x || "").trim());

      return Config.HEADERS.TAREAS_CONSOLIDADO.every(nombre => headers.indexOf(nombre) >= 0);
    } catch (e) {
      return false;
    }
  }

  static _asegurarHojaRaw() {
    const ss = DataSourceSheets.obtenerSpreadsheet();
    let h = ss.getSheetByName(Config.HOJAS.RAW_OBRAS);
    if (!h) h = ss.insertSheet(Config.HOJAS.RAW_OBRAS);

    if (!DataSourceSheets._hojas) DataSourceSheets._hojas = {};
    DataSourceSheets._hojas[Config.HOJAS.RAW_OBRAS] = h;
    return h;
  }

  static _validarHeaders(headers) {
    const actuales = (headers || []).map(x => String(x || "").trim());
    Config.HEADERS.TAREAS_CONSOLIDADO.forEach(nombre => {
      if (actuales.indexOf(nombre) < 0) {
        throw new Error(`Falta encabezado requerido del consolidado: ${nombre}`);
      }
    });
  }

  static _leerControl() {
    const ss = DataSourceSheets.obtenerSpreadsheet();
    const h = ss.getSheetByName(Config.HOJAS.CONTROL);
    if (!h || h.getLastRow() < 1) {
      return { marcaFuente: 0, fechaProceso: null, archivo: "" };
    }

    const valores = h
      .getRange(1, 1, h.getLastRow(), Math.max(h.getLastColumn(), 2))
      .getValues();

    const mapa = {};
    valores.forEach(f => {
      const k = String(f[0] || "").trim();
      if (k) mapa[k] = f[1];
    });

    return {
      marcaFuente: Number(mapa.CONSOLIDADO_MARCA_FUENTE || 0),
      fechaProceso: mapa.CONSOLIDADO_FECHA_PROCESO instanceof Date
        ? mapa.CONSOLIDADO_FECHA_PROCESO
        : null,
      archivo: String(mapa.CONSOLIDADO_ARCHIVO || "")
    };
  }

  static _guardarControl(info) {
    const ss = DataSourceSheets.obtenerSpreadsheet();
    let h = ss.getSheetByName(Config.HOJAS.CONTROL);
    if (!h) h = ss.insertSheet(Config.HOJAS.CONTROL);

    this._upsertControl(h, "CONSOLIDADO_MARCA_FUENTE", info.marcaFuente);
    this._upsertControl(h, "CONSOLIDADO_FECHA_PROCESO", info.fechaProceso);
    this._upsertControl(h, "CONSOLIDADO_ARCHIVO", info.archivo);

    const filaFecha = this._buscarFilaControl(h, "CONSOLIDADO_FECHA_PROCESO");
    if (filaFecha > 0) h.getRange(filaFecha, 2).setNumberFormat("dd/MM/yyyy HH:mm");
  }

  static _upsertControl(hoja, clave, valor) {
    const fila = this._buscarFilaControl(hoja, clave);
    if (fila > 0) {
      hoja.getRange(fila, 2).setValue(valor);
      return;
    }
    hoja.appendRow([clave, valor]);
  }

  static _buscarFilaControl(hoja, clave) {
    const lr = hoja.getLastRow();
    if (lr < 1) return 0;
    const claves = hoja.getRange(1, 1, lr, 1).getDisplayValues().flat();
    const buscada = String(clave || "").trim();
    for (let i = 0; i < claves.length; i++) {
      if (String(claves[i] || "").trim() === buscada) return i + 1;
    }
    return 0;
  }
}

function actualizarConsolidadoObras() {
  const r = ConsolidadoUpdateService.actualizarSiCorresponde();
  Logger.log(JSON.stringify({
    actualizado: r.actualizado,
    motivo: r.motivo,
    archivo: r.archivo,
    fechaDatos: r.fechaDatos
  }));
  return r;
}
