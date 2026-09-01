// ======================================================
// GUI_SUPERVISION.JS
// Flujo conversacional CU01: menú e inicio de supervisión.
// ======================================================
class GUI_Supervision {
  static procesar(chatId, telegramId, texto, usuario, sesion = null) {
    sesion = sesion || BLL_SesionTelegram.obtener(telegramId);
    const estado = sesion ? String(sesion.EstadoConversacion || "") : "";

    if (this._esVolverMenu(texto)) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipal(chatId, usuario);
    }

    if (!estado) {
      return this._procesarMenuPrincipal(chatId, telegramId, texto, usuario);
    }

    if (estado === "SUP_BUSCAR_OBRA") {
      return this._buscarObra(chatId, telegramId, texto, usuario);
    }

    if (estado === "SUP_SELECCIONAR_OBRA") {
      return this._seleccionarObra(chatId, telegramId, texto, usuario);
    }

    if (estado === "SUP_CONFIRMAR_INICIO") {
      return this._confirmarInicio(chatId, telegramId, texto, usuario);
    }

    if (estado === "SUP_SELECCIONAR_EN_CURSO") {
      return this._seleccionarEnCurso(chatId, telegramId, texto, usuario);
    }

    if (estado === "SUP_SELECCIONAR_FINALIZADA") {
      return this._seleccionarFinalizada(chatId, telegramId, texto, usuario);
    }

    if (estado === "SUP_OBRA_ACTIVA") {
      return this._procesarObraActiva(chatId, telegramId, texto, usuario, sesion);
    }

    BLL_SesionTelegram.limpiar(telegramId);
    return this._mostrarMenuPrincipal(chatId, usuario, "La conversación anterior no pudo recuperarse.");
  }

  static _procesarMenuPrincipal(chatId, telegramId, texto, usuario) {
    const opcion = this._normalizar(texto);

    if (opcion === "INICIAR NUEVA SUPERVISION") {
      BLL_SesionTelegram.guardar(telegramId, "SUP_BUSCAR_OBRA", "", {});
      return TelegramService.enviarMensaje(
        chatId,
        "Ingresá el <b>código de obra</b> o una parte del código:",
        TelegramService.teclado([["Volver al menú"]])
      );
    }

    if (opcion === "SUPERVISIONES EN CURSO") {
      return this._mostrarSupervisionesEnCurso(chatId, telegramId, usuario);
    }

    if (opcion === "SUPERVISIONES FINALIZADAS") {
      return this._mostrarSupervisionesFinalizadas(chatId, telegramId, usuario);
    }

    return this._mostrarMenuPrincipal(chatId, usuario);
  }

  static _buscarObra(chatId, telegramId, texto, usuario) {
    try {
      const obras = BLL_Obra.buscar(texto);

      if (!obras.length) {
        return TelegramService.enviarMensaje(
          chatId,
          "No encontré obras con ese código. Probá nuevamente.",
          TelegramService.teclado([["Volver al menú"]])
        );
      }

      if (obras.length === 1) {
        return this._prepararConfirmacionObra(chatId, telegramId, obras[0], usuario);
      }

      const codigos = obras.map(x => x.CodigoObra);
      BLL_SesionTelegram.guardar(
        telegramId,
        "SUP_SELECCIONAR_OBRA",
        "",
        { coincidencias: codigos }
      );

      return TelegramService.enviarMensaje(
        chatId,
        "Encontré varias obras. Seleccioná una:",
        TelegramService.teclado([
          ...codigos.map(x => [x]),
          ["Volver al menú"]
        ])
      );
    } catch (error) {
      return TelegramService.enviarMensaje(
        chatId,
        this._mensajeError(error),
        TelegramService.teclado([["Volver al menú"]])
      );
    }
  }

  static _seleccionarObra(chatId, telegramId, texto, usuario) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigo = String(texto || "").trim().toUpperCase();
    const coincidencias = Array.isArray(contexto.coincidencias) ? contexto.coincidencias : [];

    if (!coincidencias.includes(codigo)) {
      return TelegramService.enviarMensaje(
        chatId,
        "Seleccioná una de las obras encontradas.",
        TelegramService.teclado([
          ...coincidencias.map(x => [x]),
          ["Volver al menú"]
        ])
      );
    }

    const obra = BLL_Obra.obtener(codigo);
    if (!obra) {
      BLL_SesionTelegram.guardar(telegramId, "SUP_BUSCAR_OBRA", "", {});
      return TelegramService.enviarMensaje(
        chatId,
        "La obra seleccionada ya no está disponible. Ingresá nuevamente el código.",
        TelegramService.teclado([["Volver al menú"]])
      );
    }

    return this._prepararConfirmacionObra(chatId, telegramId, obra, usuario);
  }

  static _prepararConfirmacionObra(chatId, telegramId, obra, usuario) {
    BLL_SesionTelegram.guardar(
      telegramId,
      "SUP_CONFIRMAR_INICIO",
      obra.CodigoObra,
      { codigoObra: obra.CodigoObra }
    );

    return TelegramService.enviarMensaje(
      chatId,
      `<b>Confirmar inicio de supervisión</b>\n\nObra: <b>${this._esc(obra.CodigoObra)}</b>\nFamilia: <b>${this._esc(obra.Familia)}</b>`,
      TelegramService.teclado([["Iniciar supervisión"], ["Volver al menú"]])
    );
  }

  static _confirmarInicio(chatId, telegramId, texto, usuario) {
    if (this._normalizar(texto) !== "INICIAR SUPERVISION") {
      return TelegramService.enviarMensaje(
        chatId,
        "Para comenzar seleccioná <b>Iniciar supervisión</b>.",
        TelegramService.teclado([["Iniciar supervisión"], ["Volver al menú"]])
      );
    }

    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(contexto.codigoObra || "").trim().toUpperCase();

    try {
      const resultado = BLL_Supervision.iniciar(
        codigoObra,
        usuario.CodUsuario,
        true
      );

      BLL_SesionTelegram.guardar(
        telegramId,
        "SUP_OBRA_ACTIVA",
        codigoObra,
        {}
      );

      const prefijo = resultado.existente
        ? "La obra ya tenía una supervisión en curso. La dejamos como obra activa."
        : "Supervisión iniciada correctamente.";

      return this._mostrarObraActiva(
        chatId,
        resultado.supervision,
        prefijo
      );
    } catch (error) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipal(chatId, usuario, this._mensajeError(error));
    }
  }

  static _procesarObraActiva(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();

    if (opcion === "REPORTAR OBSERVACION" || opcion === "VER OBSERVACIONES" || opcion === "FINALIZAR SUPERVISION") {
      return TelegramService.enviarMensaje(
        chatId,
        "Ese bloque de CU01 lo implementamos en el siguiente paso. La supervisión actual sigue <b>EN CURSO</b>.",
        this._tecladoObraActiva()
      );
    }

    const supervision = codigoObra ? BLL_Supervision.obtener(codigoObra) : null;
    if (!supervision) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipal(chatId, usuario, "No pude recuperar la supervisión activa.");
    }

    return this._mostrarObraActiva(chatId, supervision);
  }

  static _mostrarSupervisionesEnCurso(chatId, telegramId, usuario) {
    const supervisiones = BLL_Supervision.listarEnCurso();

    if (!supervisiones.length) {
      return this._mostrarMenuPrincipal(chatId, usuario, "No hay supervisiones en curso.");
    }

    const codigos = supervisiones.map(x => x.CodigoObra);
    BLL_SesionTelegram.guardar(
      telegramId,
      "SUP_SELECCIONAR_EN_CURSO",
      "",
      { coincidencias: codigos }
    );

    return TelegramService.enviarMensaje(
      chatId,
      "<b>Supervisiones en curso</b>\n\nSeleccioná una obra para dejarla activa:",
      TelegramService.teclado([
        ...codigos.map(x => [x]),
        ["Volver al menú"]
      ])
    );
  }

  static _seleccionarEnCurso(chatId, telegramId, texto, usuario) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigo = String(texto || "").trim().toUpperCase();
    const coincidencias = Array.isArray(contexto.coincidencias) ? contexto.coincidencias : [];

    if (!coincidencias.includes(codigo)) {
      return TelegramService.enviarMensaje(
        chatId,
        "Seleccioná una de las supervisiones en curso.",
        TelegramService.teclado([
          ...coincidencias.map(x => [x]),
          ["Volver al menú"]
        ])
      );
    }

    const supervision = BLL_Supervision.obtener(codigo);
    if (!supervision || supervision.Estado !== Config.ESTADOS_SUPERVISION.EN_CURSO) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipal(chatId, usuario, "La supervisión seleccionada ya no está en curso.");
    }

    BLL_SesionTelegram.guardar(telegramId, "SUP_OBRA_ACTIVA", codigo, {});
    return this._mostrarObraActiva(chatId, supervision);
  }

  static _mostrarSupervisionesFinalizadas(chatId, telegramId, usuario) {
    const supervisiones = BLL_Supervision.listarFinalizadas();

    if (!supervisiones.length) {
      return this._mostrarMenuPrincipal(chatId, usuario, "No hay supervisiones finalizadas.");
    }

    const codigos = supervisiones.map(x => x.CodigoObra);
    BLL_SesionTelegram.guardar(
      telegramId,
      "SUP_SELECCIONAR_FINALIZADA",
      "",
      { coincidencias: codigos }
    );

    return TelegramService.enviarMensaje(
      chatId,
      "<b>Supervisiones finalizadas</b>\n\nSeleccioná una obra para consultar:",
      TelegramService.teclado([
        ...codigos.map(x => [x]),
        ["Volver al menú"]
      ])
    );
  }

  static _seleccionarFinalizada(chatId, telegramId, texto, usuario) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigo = String(texto || "").trim().toUpperCase();
    const coincidencias = Array.isArray(contexto.coincidencias) ? contexto.coincidencias : [];

    if (!coincidencias.includes(codigo)) {
      return TelegramService.enviarMensaje(
        chatId,
        "Seleccioná una de las supervisiones finalizadas.",
        TelegramService.teclado([
          ...coincidencias.map(x => [x]),
          ["Volver al menú"]
        ])
      );
    }

    const supervision = BLL_Supervision.obtener(codigo);
    if (!supervision || supervision.Estado !== Config.ESTADOS_SUPERVISION.FINALIZADA) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipal(chatId, usuario, "La supervisión seleccionada no está finalizada.");
    }

    return TelegramService.enviarMensaje(
      chatId,
      `<b>Supervisión finalizada</b>\nObra: <b>${this._esc(supervision.CodigoObra)}</b>\nInicio: ${this._fecha(supervision.FechaInicio)}\nFinalización: ${this._fecha(supervision.FechaFinalizacion)}`,
      TelegramService.teclado([["Volver al menú"]])
    );
  }

  static _mostrarMenuPrincipal(chatId, usuario, prefijo = "") {
    const saludo = `Hola <b>${this._esc(usuario.Nombre)}</b>.\nRol: <b>${this._esc(usuario.RolAprobado)}</b>.`;
    const mensaje = `${prefijo ? `${prefijo}\n\n` : ""}${saludo}\n\n¿Qué querés hacer?`;

    return TelegramService.enviarMensaje(
      chatId,
      mensaje,
      this._tecladoMenuPrincipal()
    );
  }

  static _mostrarObraActiva(chatId, supervision, prefijo = "") {
    const mensaje = `${prefijo ? `${prefijo}\n\n` : ""}<b>Obra activa</b>\nObra: <b>${this._esc(supervision.CodigoObra)}</b>\nEstado: <b>${this._esc(supervision.Estado)}</b>\nInicio: ${this._fecha(supervision.FechaInicio)}`;

    return TelegramService.enviarMensaje(
      chatId,
      mensaje,
      this._tecladoObraActiva()
    );
  }

  static _tecladoMenuPrincipal() {
    return TelegramService.teclado([
      ["Iniciar nueva supervisión"],
      ["Supervisiones en curso"],
      ["Supervisiones finalizadas"]
    ]);
  }

  static _tecladoObraActiva() {
    return TelegramService.teclado([
      ["Reportar observación"],
      ["Ver observaciones"],
      ["Finalizar supervisión"],
      ["Volver al menú"]
    ]);
  }

  static _esVolverMenu(texto) {
    return this._normalizar(texto) === "VOLVER AL MENU";
  }

  static _normalizar(texto) {
    return String(texto || "")
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  }

  static _fecha(fecha) {
    return fecha
      ? Utilities.formatDate(new Date(fecha), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm")
      : "-";
  }

  static _esc(valor) {
    return String(valor == null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  static _mensajeError(error) {
    return error && error.message
      ? this._esc(error.message)
      : "No se pudo completar la operación.";
  }
}
