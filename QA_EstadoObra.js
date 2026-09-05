// ======================================================
// QA_ESTADOOBRA.JS
// Pruebas del Incremento 03: núcleo de Estado de Obra.
// ======================================================
function QA_EstadoObra(){
  const q=new QA_Runner("SPRINT2A - ESTADO DE OBRA / REGLAS");
  const t=(ticket,ec,sup,mat)=>new BE_Tarea(ticket,"QU726AF",ec,sup,mat);

  q.caso("QA-E01","Completada EC válida","COMPLETADA sin estados de exclusión cuenta como completada y suma al total.",()=>{
    const r=BLL_EstadoObra.resumirTareas([t("T01","COMPLETADA","PENDIENTE","")]);
    QA_Assert.igual(r.totalTareas,1); QA_Assert.igual(r.tareasCompletadasEC,1); return r;
  });

  q.caso("QA-E02","Rechazo Administrativo vuelve a pendiente EC","No cuenta completada; sí suma total, pendiente EC y observación RA.",()=>{
    const r=BLL_EstadoObra.resumirTareas([t("T02","COMPLETADA","RECHAZO_ADMINISTRATIVO","")]);
    QA_Assert.igual(r.totalTareas,1); QA_Assert.igual(r.tareasCompletadasEC,0); QA_Assert.igual(r.tareasPendientesEjecucionEC,1); QA_Assert.igual(r.rechazoAdministrativo,1); return r;
  });

  q.caso("QA-E03","Rechazo Total queda fuera del total","No cuenta completada ni cancelada; aparece como excepción Rechazo Total.",()=>{
    const r=BLL_EstadoObra.resumirTareas([t("T03","COMPLETADA","RECHAZO_TOTAL","")]);
    QA_Assert.igual(r.totalTareas,0); QA_Assert.igual(r.tareasCompletadasEC,0); QA_Assert.igual(r.tareasCanceladas,0); QA_Assert.igual(r.rechazoTotalSupervision,1); return r;
  });

  q.caso("QA-E04","NO REALIZADA es cancelada","NO REALIZADA queda fuera del total y cuenta solo como cancelada.",()=>{
    const r=BLL_EstadoObra.resumirTareas([t("T04","NO REALIZADA","","")]);
    QA_Assert.igual(r.totalTareas,0); QA_Assert.igual(r.tareasCanceladas,1); QA_Assert.igual(r.tareasPendientesEjecucionEC,0); return r;
  });

  q.caso("QA-E05","Estados pendientes EC","Los cinco estados operativos definidos cuentan como pendientes de ejecución EC.",()=>{
    const estados=["AGENDADA","ASIGNADA","EN VIAJE","INICIADA","PENDIENTE AGENDAMIENTO"];
    const r=BLL_EstadoObra.resumirTareas(estados.map((e,i)=>t("P"+i,e,"","")));
    QA_Assert.igual(r.totalTareas,5); QA_Assert.igual(r.tareasPendientesEjecucionEC,5); return estados;
  });

  q.caso("QA-E06","Aprobación de Supervisión","COMPLETADA + APROBADA cuenta aprobación independientemente del material.",()=>{
    const r=BLL_EstadoObra.resumirTareas([t("T06","COMPLETADA","APROBADA","SIN INICIAR")]);
    QA_Assert.igual(r.tareasAprobadasSupervision,1); return r;
  });

  q.caso("QA-E07","Pendiente de aprobación Supervisión","COMPLETADA + PENDIENTE cuenta pendiente de aprobación.",()=>{
    const r=BLL_EstadoObra.resumirTareas([t("T07","COMPLETADA","PENDIENTE","")]);
    QA_Assert.igual(r.tareasPendientesAprobacionSupervision,1); return r;
  });

  q.caso("QA-E08","Consumo CRM cerrado","COMPLETADA + APROBADA + CERRADO/NO CONSUME MATERIALES cuenta consumo CRM.",()=>{
    const r=BLL_EstadoObra.resumirTareas([t("T08","COMPLETADA","APROBADA","CERRADO/NO CONSUME MATERIALES")]);
    QA_Assert.igual(r.tareasConsumoCRM,1); QA_Assert.igual(r.tareasPendientesConsumoCRM,0); return r;
  });

  q.caso("QA-E09","Pendientes consumo CRM","SIN INICIAR y EN GENERACION POR CONTRATISTA cuentan como pendientes CRM.",()=>{
    const r=BLL_EstadoObra.resumirTareas([t("T09A","COMPLETADA","APROBADA","SIN INICIAR"),t("T09B","COMPLETADA","APROBADA","EN GENERACION POR CONTRATISTA")]);
    QA_Assert.igual(r.tareasPendientesConsumoCRM,2); return r;
  });

  q.caso("QA-E10","Pendiente de cierre CRM es excepción","PENDIENTE DE CIERRE no cuenta como pendiente de consumo y aparece en excepciones.",()=>{
    const r=BLL_EstadoObra.resumirTareas([t("T10","COMPLETADA","APROBADA","PENDIENTE DE CIERRE")]);
    QA_Assert.igual(r.tareasPendientesConsumoCRM,0); QA_Assert.igual(r.pendientesCierreMaterialesCRM,1); return r;
  });

  q.caso("QA-E11","Canceladas según reglas","CANCELADA, NO REALIZADA, COMPLETADA+CANCELADA y COMPLETADA+DUPLICADA cuentan canceladas y quedan fuera del total.",()=>{
    const tareas=[t("C1","CANCELADA","",""),t("C2","NO REALIZADA","",""),t("C3","COMPLETADA","CANCELADA",""),t("C4","COMPLETADA","DUPLICADA","")];
    const r=BLL_EstadoObra.resumirTareas(tareas); QA_Assert.igual(r.tareasCanceladas,4); QA_Assert.igual(r.totalTareas,0); return r;
  });

  q.caso("QA-E12","Detalle y contador usan la misma clasificación","Cada contador coincide con la longitud de su detalle.",()=>{
    const tareas=[t("A","COMPLETADA","APROBADA","SIN INICIAR"),t("B","COMPLETADA","RECHAZO_ADMINISTRATIVO",""),t("C","NO REALIZADA","","")];
    const r=BLL_EstadoObra.resumirTareas(tareas);
    QA_Assert.igual(r.tareasCompletadasEC,r.detalle.completadasEC.length); QA_Assert.igual(r.tareasPendientesEjecucionEC,r.detalle.pendientesEjecucionEC.length); QA_Assert.igual(r.tareasCanceladas,r.detalle.canceladas.length); return "Contadores y detalles consistentes";
  });

  q.caso("QA-E13","DAL_Tarea resuelve encabezados por nombre","Lee TEST_TAREAS aunque las columnas estén reordenadas.",()=>{
    const h=QA_Entorno.crearHoja("TEST_TAREAS",["Estado Materiales","Tareas_Estado","Moica Obra","Tareas_Ticket","Estado Supervisión"]);
    h.getRange(2,1,1,5).setValues([["SIN INICIAR","COMPLETADA","QU726AF","250514MPO00001","APROBADA"]]);
    const tareas=DAL_Tarea.listar("TEST_TAREAS"); QA_Assert.igual(tareas.length,1); QA_Assert.igual(tareas[0].Ticket,"250514MPO00001"); QA_Assert.igual(tareas[0].Obra,"QU726AF"); return tareas[0];
  });

  q.caso("QA-E14","Búsqueda de obra por prefijo","La búsqueda parcial devuelve coincidencias únicas y requiere selección posterior.",()=>{
    const h=QA_Entorno.crearHoja("TEST_TAREAS",Config.HEADERS.TAREAS_CONSOLIDADO);
    h.getRange(2,1,3,5).setValues([["T1","QU726AF","AGENDADA","",""],["T2","QU726 FO1","COMPLETADA","PENDIENTE",""],["T3","AB100AF","AGENDADA","",""]]);
    const obras=DAL_Tarea.buscarObras("QU726","TEST_TAREAS"); QA_Assert.igual(obras.length,2); return obras;
  });

  q.caso("QA-E15","Resumen por obra no mezcla tareas","BLL resume únicamente la obra seleccionada a través del repositorio.",()=>{
    const repo={listarPorObra:obra=>[t("X1","AGENDADA","",""),t("X2","COMPLETADA","APROBADA","CERRADO/NO CONSUME MATERIALES")]};
    const r=BLL_EstadoObra.obtenerResumenPorObra("QU726AF",repo); QA_Assert.igual(r.totalTareas,2); QA_Assert.igual(r.tareasPendientesEjecucionEC,1); QA_Assert.igual(r.tareasConsumoCRM,1); return r;
  });

  q.caso("QA-E16","EC desde Última EC del Consolidado","La cabecera prioriza el valor real de Última EC presente en las tareas de RAW_OBRAS.",()=>{
    const tarea=new BE_Tarea("T16","ST849BF","COMPLETADA","APROBADA","CERRADO/NO CONSUME MATERIALES","EC PRUEBA");
    const info=BLL_EstadoObra.obtenerInformacionCabecera("ST849BF",{}, {}, {buscarPorObra:()=>null}, [tarea]);
    QA_Assert.igual(info.ec,"EC PRUEBA");
    return info.ec;
  });

  const r=q.resumen(); QA_imprimir(r); return r;
}

function QA_Incremento_EstadoObra(){
  let re=null,rp=null,rs=null;
  try{
    QA_Entorno.preparar();
    re=QA_EstadoObra();
    rp=QA_Permisos();
    rs=QA_Sprint1();
    const combinado={grupo:"INCREMENTO ESTADO OBRA + PERMISOS + REGRESIÓN SPRINT1",total:re.total+rp.total+rs.total,ok:re.ok+rp.ok+rs.ok,fallas:re.fallas+rp.fallas+rs.fallas,detalle:[].concat(re.detalle,rp.detalle,rs.detalle)};
    QA_imprimir(combinado);
    return combinado;
  }finally{
    QA_Entorno.limpiar();
    Logger.log(`[QA] ${QA_Entorno.verificarLimpieza()}`);
  }
}
