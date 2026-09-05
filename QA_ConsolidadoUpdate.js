// ======================================================
// QA_CONSOLIDADOUPDATE.JS
// QA del criterio de actualización del Consolidado.
// No toca Drive ni RAW_OBRAS productivo: usa dobles de prueba.
// ======================================================
function QA_ConsolidadoUpdate() {
  const q = new QA_Runner("SPRINT2A - CONSOLIDADO / ACTUALIZACIÓN");

  function conDobles(config, ejecutar) {
    const originales = {
      archivo: ConsolidadoUpdateService._archivoMasReciente,
      control: ConsolidadoUpdateService._leerControl,
      raw: ConsolidadoUpdateService._rawValida,
      importar: ConsolidadoUpdateService._importarFuente,
      guardar: ConsolidadoUpdateService._guardarControl,
      cacheValido: EstadoObraCacheService.esValido,
      cacheReconstruir: EstadoObraCacheService.reconstruir
    };

    let importaciones = 0;
    let guardado = null;
    let reconstruccionesCache = 0;
    const fechaFuente = config.fechaFuente || new Date(2026, 8, 4, 10, 0, 0);
    const fuente = {
      getLastUpdated: () => fechaFuente,
      getName: () => config.nombreArchivo || "ConsolidadoPorTarea.csv"
    };

    try {
      ConsolidadoUpdateService._archivoMasReciente = () => fuente;
      ConsolidadoUpdateService._leerControl = () => config.control || { marcaFuente: 0, fechaProceso: null, archivo: "" };
      ConsolidadoUpdateService._rawValida = () => !!config.rawValida;
      ConsolidadoUpdateService._importarFuente = () => { importaciones++; };
      ConsolidadoUpdateService._guardarControl = info => { guardado = info; };
      EstadoObraCacheService.esValido = () => config.cacheValido !== false;
      EstadoObraCacheService.reconstruir = () => { reconstruccionesCache++; return { obras: 2, tareas: 3 }; };
      return ejecutar({ fuente, fechaFuente, importaciones: () => importaciones, guardado: () => guardado, reconstruccionesCache: () => reconstruccionesCache });
    } finally {
      ConsolidadoUpdateService._archivoMasReciente = originales.archivo;
      ConsolidadoUpdateService._leerControl = originales.control;
      ConsolidadoUpdateService._rawValida = originales.raw;
      ConsolidadoUpdateService._importarFuente = originales.importar;
      ConsolidadoUpdateService._guardarControl = originales.guardar;
      EstadoObraCacheService.esValido = originales.cacheValido;
      EstadoObraCacheService.reconstruir = originales.cacheReconstruir;
    }
  }

  q.caso("QA-C01", "RAW vacío carga la última fuente disponible", "Debe importar aunque el archivo fuente no sea de hoy.", () =>
    conDobles({ rawValida: false, fechaFuente: new Date(2026, 8, 4, 10, 0, 0) }, x => {
      const r = ConsolidadoUpdateService.actualizarSiCorresponde();
      QA_Assert.igual(r.actualizado, true);
      QA_Assert.igual(r.motivo, "BASE_INICIAL_CARGADA");
      QA_Assert.igual(x.importaciones(), 1);
      return r.motivo;
    })
  );

  q.caso("QA-C02", "Fuente modificada actualiza una RAW válida", "Si cambia getLastUpdated debe volver a importar.", () =>
    conDobles({
      rawValida: true,
      fechaFuente: new Date(2026, 8, 5, 9, 0, 0),
      control: { marcaFuente: new Date(2026, 8, 4, 9, 0, 0).getTime(), fechaProceso: new Date(2026, 8, 4, 9, 5, 0), archivo: "viejo.csv" }
    }, x => {
      const r = ConsolidadoUpdateService.actualizarSiCorresponde();
      QA_Assert.igual(r.actualizado, true);
      QA_Assert.igual(r.motivo, "FUENTE_ACTUALIZADA");
      QA_Assert.igual(x.importaciones(), 1);
      return r.motivo;
    })
  );

  q.caso("QA-C03", "Misma fuente y RAW válida no reprocesa", "Debe conservar la base y la fecha de procesamiento anterior.", () => {
    const fechaFuente = new Date(2026, 8, 5, 9, 0, 0);
    const fechaProceso = new Date(2026, 8, 5, 9, 5, 0);
    return conDobles({
      rawValida: true,
      fechaFuente,
      control: { marcaFuente: fechaFuente.getTime(), fechaProceso, archivo: "actual.csv" }
    }, x => {
      const r = ConsolidadoUpdateService.actualizarSiCorresponde();
      QA_Assert.igual(r.actualizado, false);
      QA_Assert.igual(r.motivo, "SIN_CAMBIOS");
      QA_Assert.igual(x.importaciones(), 0);
      QA_Assert.igual(r.fechaDatos.getTime(), fechaProceso.getTime());
      return r.motivo;
    });
  });

  q.caso("QA-C04", "RAW inválida fuerza recarga aunque la marca coincida", "Una hoja vacía/corrupta debe reconstruirse con la fuente disponible.", () => {
    const fechaFuente = new Date(2026, 8, 4, 9, 0, 0);
    return conDobles({
      rawValida: false,
      fechaFuente,
      control: { marcaFuente: fechaFuente.getTime(), fechaProceso: new Date(2026, 8, 4, 9, 5, 0), archivo: "actual.csv" }
    }, x => {
      const r = ConsolidadoUpdateService.actualizarSiCorresponde();
      QA_Assert.igual(r.actualizado, true);
      QA_Assert.igual(x.importaciones(), 1);
      return r.motivo;
    });
  });

  q.caso("QA-C05", "Control se actualiza solo después de importar", "Luego de una importación exitosa debe guardar marca, fecha de proceso y archivo.", () =>
    conDobles({ rawValida: false }, x => {
      const r = ConsolidadoUpdateService.actualizarSiCorresponde();
      const g = x.guardado();
      QA_Assert.ok(!!g);
      QA_Assert.igual(g.archivo, "ConsolidadoPorTarea.csv");
      QA_Assert.igual(g.marcaFuente, x.fechaFuente.getTime());
      QA_Assert.ok(g.fechaProceso instanceof Date);
      return { archivo: g.archivo, marcaFuente: g.marcaFuente };
    })
  );

  q.caso("QA-C06", "Misma fuente con cache ausente reconstruye solo cache", "No reimporta RAW y deja lista la consulta rápida.", () => {
    const fechaFuente = new Date(2026, 8, 5, 9, 0, 0);
    return conDobles({
      rawValida: true,
      cacheValido: false,
      fechaFuente,
      control: { marcaFuente: fechaFuente.getTime(), fechaProceso: new Date(2026, 8, 5, 9, 5, 0), archivo: "actual.csv" }
    }, x => {
      const r = ConsolidadoUpdateService.actualizarSiCorresponde();
      QA_Assert.igual(r.actualizado, false);
      QA_Assert.igual(r.motivo, "CACHE_RECONSTRUIDA");
      QA_Assert.igual(x.importaciones(), 0);
      QA_Assert.igual(x.reconstruccionesCache(), 1);
      return r.motivo;
    });
  });

  const r = q.resumen();
  QA_imprimir(r);
  return r;
}

function QA_Incremento_ConsolidadoUpdate() {
  let rc = null, re = null, rg = null, rp = null, rs = null;
  try {
    QA_Entorno.preparar();
    rc = QA_ConsolidadoUpdate();
    re = QA_EstadoObra();
    rg = QA_EstadoObraGUI();
    rp = QA_Permisos();
    rs = QA_Sprint1();

    const combinado = {
      grupo: "CONSOLIDADO + ESTADO OBRA TELEGRAM + PERMISOS + REGRESIÓN SPRINT1",
      total: rc.total + re.total + rg.total + rp.total + rs.total,
      ok: rc.ok + re.ok + rg.ok + rp.ok + rs.ok,
      fallas: rc.fallas + re.fallas + rg.fallas + rp.fallas + rs.fallas,
      detalle: [].concat(rc.detalle, re.detalle, rg.detalle, rp.detalle, rs.detalle)
    };

    QA_imprimir(combinado);
    return combinado;
  } finally {
    QA_Entorno.limpiar();
    Logger.log(`[QA] ${QA_Entorno.verificarLimpieza()}`);
  }
}
