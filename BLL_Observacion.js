// ======================================================
// BLL_OBSERVACION.JS
// Reglas de observaciones y persistencia de evidencias.
// ======================================================
class BLL_Observacion {
  static registrar(datos, confirmado, deps = null, ahora = new Date()) {
    deps = deps || {
      supervisiones: DAL_Supervision,
      tipificaciones: DAL_Tipificacion,
      observaciones: DAL_Observacion
    };

    const t = this._validarBase(datos, confirmado, deps);
    const id = datos.idObservacion || this._nuevoId(deps.observaciones, ahora);
    const o = this._crearEntidad(datos, id, ahora);
    deps.observaciones.insertar(MAP_Observacion.BEaFila(o));
    return o;
  }

  static registrarConEvidencias(datos, telegramFileIds, confirmado, ahora = new Date()) {
    exigir(Array.isArray(telegramFileIds) && telegramFileIds.length > 0, "EVIDENCIA_REQUERIDA", "Debe adjuntar al menos una foto.");

    const deps = {
      supervisiones: DAL_Supervision,
      tipificaciones: DAL_Tipificacion,
      observaciones: DAL_Observacion
    };

    this._validarBase(datos, confirmado, deps);

    const archivosDrive = [];
    let filaObservacion = null;
    const filasEvidencia = [];
    const lock = LockService.getScriptLock();

    try {
      telegramFileIds.forEach((fileId, index) => {
        const descargado = TelegramService.descargarArchivo(fileId);
        const nombre = this._nombreFoto(datos.codigoObra, datos.codUsuario, ahora, index + 1, descargado.filePath);
        const archivo = DriveService.guardarArchivoObra(datos.codigoObra, descargado.blob, nombre);
        archivosDrive.push({ archivo, nombre });
      });

      lock.waitLock(10000);
      this._validarBase(datos, confirmado, deps);

      const idObservacion = this._nuevoId(DAL_Observacion, ahora);
      const observacion = this._crearEntidad(datos, idObservacion, ahora);
      filaObservacion = DAL_Observacion.insertar(MAP_Observacion.BEaFila(observacion));

      archivosDrive.forEach((x, index) => {
        const evidencia = new BE_Evidencia(
          this._nuevoIdEvidencia(idObservacion, index + 1),
          idObservacion,
          "FOTO",
          x.nombre,
          x.archivo.getId(),
          ahora,
          Config.ESTADOS_REGISTRO.ACTIVA
        );
        const fila = DAL_Evidencia.insertar(MAP_Evidencia.BEaFila(evidencia));
        filasEvidencia.push(fila);
      });

      return {
        observacion: observacion,
        evidencias: archivosDrive.length
      };
    } catch (error) {
      try {
        filasEvidencia.sort((a, b) => b - a).forEach(f => DAL_Evidencia.eliminarFisico(f));
        if (filaObservacion) DAL_Observacion.eliminarFisico(filaObservacion);
      } catch (rollbackError) {
        console.error(`[OBS] Error compensando Sheets: ${rollbackError.message}`);
      }

      archivosDrive.forEach(x => DriveService.eliminarArchivo(x.archivo.getId()));
      throw error;
    } finally {
      try {
        if (lock.hasLock()) lock.releaseLock();
      } catch (e) {}
    }
  }

  static editar(id, cambios, codUsuario, deps = null, ahora = new Date()) {
    deps = deps || { supervisiones: DAL_Supervision, observaciones: DAL_Observacion };
    const r = deps.observaciones.buscarPorId(id);
    exigir(r, "OBS_NO_EXISTE", "Observación inexistente.");
    const o = MAP_Observacion.FilaaBE(r.datos);
    const rs = deps.supervisiones.buscarPorObra(o.CodigoObra);
    exigir(rs && MAP_Supervision.FilaaBE(rs.datos).Estado === Config.ESTADOS_SUPERVISION.EN_CURSO, "SUPERVISION_FINALIZADA", "No se puede editar una supervisión finalizada.");
    exigir(o.Estado === Config.ESTADOS_REGISTRO.ACTIVA, "OBS_ELIMINADA", "La observación está eliminada.");
    ["IdTipificacion", "Latitud", "Longitud", "ReferenciaUbicacion", "Comentario"].forEach(k => {
      if (cambios[k] !== undefined) o[k] = cambios[k];
    });
    o.FechaUltModificacion = ahora;
    o.CodUsuarioUltModificacion = codUsuario;
    deps.observaciones.actualizar(r.fila, MAP_Observacion.BEaFila(o));
    return o;
  }

  static eliminar(id, codUsuario, deps = null, ahora = new Date()) {
    deps = deps || { supervisiones: DAL_Supervision, observaciones: DAL_Observacion };
    const r = deps.observaciones.buscarPorId(id);
    exigir(r, "OBS_NO_EXISTE", "Observación inexistente.");
    const o = MAP_Observacion.FilaaBE(r.datos);
    const rs = deps.supervisiones.buscarPorObra(o.CodigoObra);
    exigir(rs && MAP_Supervision.FilaaBE(rs.datos).Estado === Config.ESTADOS_SUPERVISION.EN_CURSO, "SUPERVISION_FINALIZADA", "No se puede eliminar una supervisión finalizada.");
    exigir(o.Estado === Config.ESTADOS_REGISTRO.ACTIVA, "OBS_ELIMINADA", "La observación ya está eliminada.");
    o.Estado = Config.ESTADOS_REGISTRO.ELIMINADA;
    o.FechaEliminacion = ahora;
    o.CodUsuarioEliminacion = codUsuario;
    deps.observaciones.actualizar(r.fila, MAP_Observacion.BEaFila(o));
    return o;
  }

  static listarActivas(codigoObra, repo = null) {
    repo = repo || DAL_Observacion;
    return repo.listarPorObra(codigoObra, true).map(r => MAP_Observacion.FilaaBE(r.datos));
  }

  static _validarBase(datos, confirmado, deps) {
    exigir(confirmado, "OBS_NO_CONFIRMADA", "Debe confirmar la observación.");
    const rs = deps.supervisiones.buscarPorObra(datos.codigoObra);
    exigir(rs, "SUPERVISION_NO_EXISTE", "No existe supervisión.");
    const s = MAP_Supervision.FilaaBE(rs.datos);
    exigir(s.Estado === Config.ESTADOS_SUPERVISION.EN_CURSO, "SUPERVISION_FINALIZADA", "La supervisión está finalizada.");

    const rt = deps.tipificaciones.buscarPorId(datos.idTipificacion);
    exigir(rt, "TIPIFICACION_NO_EXISTE", "Tipificación inexistente.");
    const t = MAP_Tipificacion.FilaaBE(rt.datos);
    exigir(t.EstadoTipificacion === "ACTIVA", "TIPIFICACION_INACTIVA", "La tipificación no está activa.");

    const tieneCoord = datos.latitud !== null && datos.latitud !== undefined && datos.longitud !== null && datos.longitud !== undefined;
    exigir(tieneCoord || String(datos.referenciaUbicacion || "").trim(), "UBICACION_REQUERIDA", "Debe indicar ubicación o referencia.");

    if (String(t.Descripcion).toUpperCase() === "OTROS") {
      exigir(String(datos.comentario || "").trim(), "COMENTARIO_REQUERIDO", "OTROS requiere comentario.");
    }

    return t;
  }

  static _crearEntidad(datos, id, ahora) {
    return new BE_Observacion(
      id,
      datos.codigoObra,
      datos.codUsuario,
      datos.idTipificacion,
      ahora,
      datos.latitud ?? null,
      datos.longitud ?? null,
      datos.referenciaUbicacion || "",
      datos.comentario || ""
    );
  }

  static _nuevoId(repo, ahora) {
    const base = Utilities.formatDate(ahora, Session.getScriptTimeZone() || "GMT", "yyyyMMddHHmmss");
    let n = 1;
    const ids = repo.listar().map(f => String(f[0]));
    while (ids.includes(`OBS${base}${String(n).padStart(3, "0")}`)) n++;
    return `OBS${base}${String(n).padStart(3, "0")}`;
  }

  static _nuevoIdEvidencia(idObservacion, indice) {
    return `EVI${String(idObservacion).replace(/^OBS/, "")}${String(indice).padStart(2, "0")}`;
  }

  static _nombreFoto(codigoObra, codUsuario, ahora, indice, filePath) {
    const fecha = Utilities.formatDate(ahora, Session.getScriptTimeZone() || "GMT", "yyyyMMdd_HHmmss");
    const ext = String(filePath || "").toLowerCase().endsWith(".png") ? ".png" : ".jpg";
    return `${fecha}_${codigoObra}_${codUsuario}_${String(indice).padStart(3, "0")}${ext}`;
  }
}
