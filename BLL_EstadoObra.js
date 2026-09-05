// ======================================================
// BLL_ESTADOOBRA.JS
// Reglas de clasificación y métricas del Estado de Obra.
// Los contadores y detalles derivan de la misma clasificación.
// ======================================================
class BLL_EstadoObra {
  static resumirTareas(tareas) {
    const detalle = {
      completadasEC: [],
      pendientesEjecucionEC: [],
      aprobadasSupervision: [],
      pendientesAprobacionSupervision: [],
      consumoCRM: [],
      pendientesConsumoCRM: [],
      rechazoAdministrativo: [],
      rechazoTotalSupervision: [],
      pendientesCierreMaterialesCRM: [],
      canceladas: []
    };

    let totalTareas = 0;
    (tareas || []).forEach(t => {
      const c = this.clasificarTarea(t);
      if (c.sumaTotal) totalTareas++;
      Object.keys(detalle).forEach(k => { if (c[k]) detalle[k].push(t); });
    });

    return {
      totalTareas,
      tareasCompletadasEC: detalle.completadasEC.length,
      tareasPendientesEjecucionEC: detalle.pendientesEjecucionEC.length,
      tareasAprobadasSupervision: detalle.aprobadasSupervision.length,
      tareasPendientesAprobacionSupervision: detalle.pendientesAprobacionSupervision.length,
      tareasConsumoCRM: detalle.consumoCRM.length,
      tareasPendientesConsumoCRM: detalle.pendientesConsumoCRM.length,
      tareasCanceladas: detalle.canceladas.length,
      rechazoAdministrativo: detalle.rechazoAdministrativo.length,
      rechazoTotalSupervision: detalle.rechazoTotalSupervision.length,
      pendientesCierreMaterialesCRM: detalle.pendientesCierreMaterialesCRM.length,
      detalle
    };
  }

  static obtenerResumenPorObra(codigoObra, tareaRepo = DAL_Tarea) {
    return this.resumirTareas(tareaRepo.listarPorObra(codigoObra));
  }

  static clasificarTarea(tarea) {
    const ec = this._n(tarea && tarea.EstadoEjecucionEC);
    const sup = this._n(tarea && tarea.EstadoSupervision);
    const mat = this._n(tarea && tarea.EstadoMaterialesCRM);

    const rechazoAdministrativo = ec === "COMPLETADA" && sup === "RECHAZO_ADMINISTRATIVO";
    const rechazoTotalSupervision = ec === "COMPLETADA" && sup === "RECHAZO_TOTAL";
    const cancelada = ec === "CANCELADA" || ec === "NO REALIZADA" || (ec === "COMPLETADA" && (sup === "CANCELADA" || sup === "DUPLICADA"));
    const excluidaTotal = cancelada || rechazoTotalSupervision;

    const estadosPendientesEC = ["AGENDADA","ASIGNADA","EN VIAJE","INICIADA","PENDIENTE AGENDAMIENTO"];
    const pendientesEjecucionEC = estadosPendientesEC.indexOf(ec) >= 0 || rechazoAdministrativo;

    const completadasEC = ec === "COMPLETADA" && ["RECHAZO_ADMINISTRATIVO","RECHAZO_TOTAL","CANCELADA","DUPLICADA"].indexOf(sup) < 0;
    const aprobadasSupervision = ec === "COMPLETADA" && sup === "APROBADA";
    const pendientesAprobacionSupervision = ec === "COMPLETADA" && sup === "PENDIENTE";
    const consumoCRM = aprobadasSupervision && mat === "CERRADO/NO CONSUME MATERIALES";
    const pendientesConsumoCRM = aprobadasSupervision && ["SIN INICIAR","EN GENERACION POR CONTRATISTA"].indexOf(mat) >= 0;
    const pendientesCierreMaterialesCRM = aprobadasSupervision && mat === "PENDIENTE DE CIERRE";

    return {
      sumaTotal: !excluidaTotal,
      completadasEC,
      pendientesEjecucionEC,
      aprobadasSupervision,
      pendientesAprobacionSupervision,
      consumoCRM,
      pendientesConsumoCRM,
      rechazoAdministrativo,
      rechazoTotalSupervision,
      pendientesCierreMaterialesCRM,
      canceladas: cancelada
    };
  }


  static obtenerInformacionCabecera(codigoObra, obraRepo = DAL_Obra, contratistaRepo = DAL_Contratista, liquidacionRepo = DAL_Liquidacion, tareas = null) {
    let ec = "";

    // La fuente primaria para EC es el propio Consolidado: encabezado exacto "Última EC".
    if (Array.isArray(tareas)) {
      const ecs = tareas.map(t => String((t && t.UltimaEC) || "").trim()).filter(Boolean);
      if (ecs.length) ec = ecs[0];
    }

    // Compatibilidad: si el Consolidado no trae EC, se intenta el mapeo existente.
    if (!ec) {
      try {
        const n = BLL_Obra.normalizarBusqueda(codigoObra);
        const localizador = typeof obraRepo.buscarLocalizadorDestinoPorObra === "function" ? obraRepo.buscarLocalizadorDestinoPorObra(n) : "";
        if (localizador) {
          const c = BLL_Contratista.obtenerPorLocalizador(localizador, contratistaRepo);
          if (c && c.NombreContratista) ec = c.NombreContratista;
        }
      } catch (e) { ec = ""; }
    }

    let estadoLiquidacion = "Sin información de liquidación";
    try {
      const liq = liquidacionRepo && typeof liquidacionRepo.buscarPorObra === "function" ? liquidacionRepo.buscarPorObra(codigoObra) : null;
      if (liq) {
        const valor = String(liq.liquidable || "").trim().toUpperCase();
        if (valor === "TRUE" || valor === "VERDADERO" || valor === "SI") {
          estadoLiquidacion = "Obra liquidada";
          if (liq.mes && liq.quincena) estadoLiquidacion += ` en ${liq.mes} - ${liq.quincena}`;
        } else if (valor === "FALSE" || valor === "FALSO" || valor === "NO") {
          estadoLiquidacion = "Pendiente de liquidación";
        }
      }
    } catch (e) { estadoLiquidacion = "Sin información de liquidación"; }

    const act = ConsolidadoUpdateService.obtenerInfoActualizacion();
    return { ec, estadoLiquidacion, fechaActualizacion: act.fechaDatos || null };
  }

  static _n(v) { return String(v || "").trim().toUpperCase(); }
}
