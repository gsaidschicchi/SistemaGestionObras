// ======================================================
// GUI_ESTADOOBRA.JS
// Flujo Telegram de Estado de Obra.
// Búsqueda -> selección explícita -> resumen -> detalles.
// ======================================================
class GUI_EstadoObra {
  static procesar(chatId, telegramId, texto, usuario, sesion = null) {
    BLL_Usuario.exigirPermiso(usuario.RolAprobado, Config.MODULOS.ESTADO_OBRA);
    const estado = sesion ? String(sesion.EstadoConversacion || "") : "";
    const opcion = this._n(texto);

    if (opcion === "MENU PRINCIPAL") {
      BLL_SesionTelegram.limpiar(telegramId);
      return GUI_Menu.mostrar(chatId, usuario);
    }
    if (opcion === "NUEVA CONSULTA") return this.iniciar(chatId, telegramId);

    if (!estado || estado === "EST_BUSCAR_OBRA") return this._buscar(chatId, telegramId, texto);
    if (estado === "EST_SELECCION_OBRA") return this._seleccionar(chatId, telegramId, texto, usuario);
    if (estado === "EST_RESUMEN") return this._procesarResumen(chatId, telegramId, texto, usuario, sesion);

    BLL_SesionTelegram.limpiar(telegramId);
    return this.iniciar(chatId, telegramId);
  }

  static iniciar(chatId, telegramId) {
    BLL_SesionTelegram.guardar(telegramId, "EST_BUSCAR_OBRA", "", {});
    return TelegramService.enviarMensaje(
      chatId,
      "<b>ESTADO DE OBRA</b>\n\nIngresá el código completo o parte de la obra que querés consultar.",
      TelegramService.teclado([["Menú principal"]])
    );
  }

  static _buscar(chatId, telegramId, texto) {
    const q = String(texto || "").trim();
    if (!q) return TelegramService.enviarMensaje(chatId, "Ingresá una obra para buscar.", TelegramService.teclado([["Menú principal"]]));
    const obras = DAL_Tarea.buscarObras(q);
    if (!obras.length) {
      BLL_SesionTelegram.guardar(telegramId, "EST_BUSCAR_OBRA", "", {});
      return TelegramService.enviarMensaje(chatId, "No encontré obras que coincidan con la búsqueda. Probá nuevamente.", TelegramService.teclado([["Menú principal"]]));
    }
    BLL_SesionTelegram.guardar(telegramId, "EST_SELECCION_OBRA", "", { coincidencias: obras });
    const filas = obras.map(o => [o]);
    filas.push(["Nueva consulta"], ["Menú principal"]);
    return TelegramService.enviarMensaje(chatId, `<b>Seleccioná la obra exacta</b>\n\nCoincidencias encontradas: ${obras.length}`, TelegramService.teclado(filas));
  }

  static _seleccionar(chatId, telegramId, texto, usuario) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const obras = Array.isArray(contexto.coincidencias) ? contexto.coincidencias : [];
    const elegida = obras.find(o => this._normalizarObra(o) === this._normalizarObra(texto));
    if (!elegida) {
      const filas = obras.map(o => [o]);
      filas.push(["Nueva consulta"], ["Menú principal"]);
      return TelegramService.enviarMensaje(chatId, "Seleccioná una de las coincidencias mostradas.", TelegramService.teclado(filas));
    }
    BLL_SesionTelegram.guardar(telegramId, "EST_RESUMEN", elegida, {});
    return this._mostrarResumen(chatId, elegida);
  }

  static _procesarResumen(chatId, telegramId, texto, usuario, sesion) {
    const obra = String((sesion && sesion.CodigoObraActiva) || "").trim();
    if (!obra) return this.iniciar(chatId, telegramId);
    const op = this._n(texto);
    if (op === "DETALLE AVANCE") return this._mostrarDetalle(chatId, obra, "AVANCE");
    if (op === "DETALLE PENDIENTES") return this._mostrarDetalle(chatId, obra, "PENDIENTES");
    if (op === "DETALLE OBSERVACIONES") return this._mostrarDetalle(chatId, obra, "OBSERVACIONES");
    return this._mostrarResumen(chatId, obra);
  }

  static _mostrarResumen(chatId, obra) {
    const tareas = DAL_Tarea.listarPorObra(obra);
    const resumen = BLL_EstadoObra.resumirTareas(tareas);
    const info = BLL_EstadoObra.obtenerInformacionCabecera(obra, DAL_Obra, DAL_Contratista, DAL_Liquidacion, tareas);
    const fecha = info.fechaActualizacion ? Utilities.formatDate(new Date(info.fechaActualizacion), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm") : "Sin fecha de actualización";
    const msg = [
      "<b>RESUMEN GENERAL</b>",
      `Información actualizada: ${this._esc(fecha)}`,
      `Obra: ${this._esc(obra)}`,
      `EC: ${this._esc(info.ec || "Sin información de EC")}`,
      `Estado de liquidación: ${this._esc(info.estadoLiquidacion || "Sin información de liquidación")}`,
      "",
      "<b>TOTAL</b>",
      `Total de tareas: ${resumen.totalTareas}`,
      "",
      "<b>AVANCE</b>",
      `Completadas EC: ${resumen.tareasCompletadasEC}`,
      `Aprobación Supervisión: ${resumen.tareasAprobadasSupervision}`,
      `Consumo CRM: ${resumen.tareasConsumoCRM}`,
      "",
      "<b>PENDIENTES</b>",
      `Ejecución EC: ${resumen.tareasPendientesEjecucionEC}`,
      `Aprobación Supervisión: ${resumen.tareasPendientesAprobacionSupervision}`,
      `Consumo CRM: ${resumen.tareasPendientesConsumoCRM}`,
      "",
      "<b>OBSERVACIONES / EXCEPCIONES</b>",
      `Rechazo Administrativo: ${resumen.rechazoAdministrativo}`,
      `Canceladas: ${resumen.tareasCanceladas}`,
      `Rechazo Total: ${resumen.rechazoTotalSupervision}`,
      `Pendiente de Cierre Materiales (CRM): ${resumen.pendientesCierreMaterialesCRM}`,
      "",
      "<i>La información proviene de un reporte operativo que puede presentar un desfase de hasta 24 hs respecto a la realidad.</i>"
    ].join("\n");
    return TelegramService.enviarMensaje(chatId, msg, TelegramService.teclado([["Detalle avance"],["Detalle pendientes"],["Detalle observaciones"],["Nueva consulta"],["Menú principal"]]));
  }

  static _mostrarDetalle(chatId, obra, tipo) {
    const r = BLL_EstadoObra.obtenerResumenPorObra(obra);
    let secciones = [];
    if (tipo === "AVANCE") secciones = [
      ["COMPLETADAS EC", r.detalle.completadasEC, "EC"],
      ["APROBADAS SUPERVISIÓN", r.detalle.aprobadasSupervision, "SUP"],
      ["CONSUMO CRM", r.detalle.consumoCRM, "MAT"]
    ];
    if (tipo === "PENDIENTES") secciones = [
      ["PENDIENTES EJECUCIÓN EC", r.detalle.pendientesEjecucionEC, "EC"],
      ["PENDIENTES APROBACIÓN SUPERVISIÓN", r.detalle.pendientesAprobacionSupervision, "SUP"],
      ["PENDIENTES CONSUMO CRM", r.detalle.pendientesConsumoCRM, "MAT"]
    ];
    if (tipo === "OBSERVACIONES") secciones = [
      ["RECHAZO ADMINISTRATIVO", r.detalle.rechazoAdministrativo, "SUP"],
      ["CANCELADAS", r.detalle.canceladas, "EC"],
      ["RECHAZO TOTAL", r.detalle.rechazoTotalSupervision, "SUP"],
      ["PENDIENTE DE CIERRE MATERIALES (CRM)", r.detalle.pendientesCierreMaterialesCRM, "MAT"]
    ];
    const lineas = [`<b>${this._esc(tipo)}</b>`, `Obra: ${this._esc(obra)}`];
    secciones.forEach(s => {
      lineas.push("", `<b>${s[0]}</b>`);
      if (!s[1].length) lineas.push("Sin tareas.");
      else s[1].forEach(t => lineas.push(this._lineaTarea(t, s[2])));
    });
    return this._enviarLargo(chatId, lineas.join("\n"), TelegramService.teclado([["Detalle avance"],["Detalle pendientes"],["Detalle observaciones"],["Nueva consulta"],["Menú principal"]]));
  }

  static _lineaTarea(t, campo) {
    const ticket = this._esc(t.Ticket);
    if (campo === "SUP") return `${ticket} | ${this._esc(t.EstadoSupervision)}`;
    if (campo === "MAT") return `${ticket} | ${this._esc(t.EstadoMaterialesCRM)}`;
    return `${ticket} | ${this._esc(t.EstadoEjecucionEC)}`;
  }

  static _enviarLargo(chatId, texto, teclado) {
    const max = 3800;
    if (texto.length <= max) return TelegramService.enviarMensaje(chatId, texto, teclado);
    const lineas = texto.split("\n");
    let bloque = "", respuesta = null;
    lineas.forEach(linea => {
      const candidato = bloque ? `${bloque}\n${linea}` : linea;
      if (candidato.length > max && bloque) { respuesta = TelegramService.enviarMensaje(chatId, bloque); bloque = linea; }
      else bloque = candidato;
    });
    if (bloque) respuesta = TelegramService.enviarMensaje(chatId, bloque, teclado);
    return respuesta;
  }

  static _n(v) { return String(v || "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(); }
  static _normalizarObra(v) { return String(v || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  static _esc(v) { return String(v == null ? "" : v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
}
