// ======================================================
// QA_PERFORMANCEESTADOOBRA.JS
// Diagnóstico no destructivo sobre RAW_OBRAS productiva.
// ======================================================
function QA_MedirPerformanceEstadoObra() {
  const inicioBusqueda = Date.now();
  const obras = DAL_Tarea.buscarObras("ST849");
  const msBusqueda = Date.now() - inicioBusqueda;

  const obra = obras.indexOf("ST849BF") >= 0 ? "ST849BF" : (obras[0] || "");
  if (!obra) throw new Error("No se encontró una obra para medir el resumen.");

  const inicioResumen = Date.now();
  const tareas = DAL_Tarea.listarPorObra(obra);
  const resumen = BLL_EstadoObra.resumirTareas(tareas);
  const info = BLL_EstadoObra.obtenerInformacionCabecera(obra, DAL_Obra, DAL_Contratista, DAL_Liquidacion, tareas);
  const msResumen = Date.now() - inicioResumen;

  Logger.log(JSON.stringify({
    obra,
    coincidencias: obras.length,
    tareas: tareas.length,
    ec: info.ec || "",
    busqueda_ms: msBusqueda,
    resumen_ms: msResumen,
    total_ms: msBusqueda + msResumen,
    total_tareas_resumen: resumen.totalTareas
  }));
}
