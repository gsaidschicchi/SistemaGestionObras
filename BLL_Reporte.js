// ======================================================
// BLL_REPORTE.JS
// Reglas de armado, versionado y persistencia del reporte.
// ======================================================
class BLL_Reporte {
  static generar(codigoObra, codUsuario, comentarioGeneral = "", ahora = new Date()) {
    const supervision = BLL_Supervision.obtener(codigoObra);
    exigir(supervision, "SUPERVISION_NO_EXISTE", "No existe supervisión.");
    exigir(supervision.Estado === Config.ESTADOS_SUPERVISION.FINALIZADA, "SUPERVISION_EN_CURSO", "Solo se reportan supervisiones finalizadas.");

    const obra = BLL_Obra.obtener(codigoObra) || new BE_Obra(codigoObra, "", BLL_Obra.determinarFamilia(codigoObra), Config.ACTIVO.SI);
    const contratista = obra.IdContratista ? BLL_Contratista.obtenerPorId(obra.IdContratista) : null;
    const nombreContratista = contratista ? contratista.NombreContratista : "-";
    const previos = DAL_Reporte.listarPorObra(codigoObra);
    let max = 0;
    previos.forEach(r => { max = Math.max(max, Number(MAP_Reporte.FilaaBE(r.datos).Version) || 0); });
    const version = max + 1;
    const idReporte = `REP-${codigoObra}-${String(version).padStart(3,"0")}`;
    const nombreArchivo = `${Utilities.formatDate(ahora, Session.getScriptTimeZone(), "yyyyMMdd")}_${codigoObra.replace(/[^A-Za-z0-9_-]/g,"_")}_REPORTE_V${version}.pdf`;

    const observaciones = BLL_Observacion.listarActivas(codigoObra).map(o => {
      const tip = BLL_Tipificacion.obtener(o.IdTipificacion) || new BE_Tipificacion(o.IdTipificacion,"","",o.IdTipificacion,"","ACTIVA");
      const u = BLL_Usuario.obtenerUsuarioPorCodUsuario(o.CodUsuario);
      const autor = u ? `${u.Nombre || ""} ${u.Apellido || ""}`.trim() : "Usuario";
      const evidencias = DAL_Evidencia.listarPorObservacion(o.IdObservacion)
        .map(r => MAP_Evidencia.FilaaBE(r.datos))
        .filter(e => e.Estado === Config.ESTADOS_REGISTRO.ACTIVA && e.Tipo === "FOTO");
      const tieneCoord = o.Latitud !== null && o.Latitud !== undefined && String(o.Latitud).trim() !== "" && o.Longitud !== null && o.Longitud !== undefined && String(o.Longitud).trim() !== "";
      const ubicacion = tieneCoord ? `${o.Latitud}, ${o.Longitud}` : (o.ReferenciaUbicacion || "-");
      return { observacion:o, tipificacion:tip, autor:autor || "Usuario", ubicacion, evidencias };
    });

    const blob = PdfService.generar({ obra, supervision, contratista:nombreContratista, comentarioGeneral, observaciones, nombreArchivo });
    let archivo = null;
    try {
      archivo = DriveService.guardarArchivoObra(codigoObra, blob, nombreArchivo);
      const reporte = new BE_Reporte(idReporte,codigoObra,version,ahora,codUsuario,comentarioGeneral,nombreArchivo,archivo.getId(),Config.ESTADOS_REPORTE.VIGENTE);
      DAL_Reporte.insertar(MAP_Reporte.BEaFila(reporte));

      previos.forEach(r => {
        const anterior = MAP_Reporte.FilaaBE(r.datos);
        if (anterior.Estado === Config.ESTADOS_REPORTE.VIGENTE) {
          anterior.Estado = Config.ESTADOS_REPORTE.REEMPLAZADO;
          DAL_Reporte.actualizar(r.fila, MAP_Reporte.BEaFila(anterior));
        }
      });
      return reporte;
    } catch (e) {
      if (archivo) DriveService.eliminarArchivo(archivo.getId());
      throw e;
    }
  }
}
