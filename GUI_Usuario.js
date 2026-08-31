// ======================================================
// GUI_USUARIO.JS
// Flujo conversacional CU00: alta y acceso de usuario.
// ======================================================
class GUI_Usuario {
  static procesar(chatId, telegramId, texto) {
    const sesion = BLL_SesionTelegram.obtener(telegramId);
    const estadoConversacion = sesion ? sesion.EstadoConversacion : "";

    if (this._esCancelar(texto)) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarAcceso(chatId, telegramId, "Operación cancelada.");
    }

    if (estadoConversacion) {
      return this._continuarAlta(chatId, telegramId, texto, estadoConversacion);
    }

    const acceso = BLL_Usuario.registrarAcceso(telegramId);

    if (acceso.estado === "NO_REGISTRADO") {
      // No se crea una sesión vacía por cada saludo. La sesión nace al iniciar el alta.
      if (this._esDarDeAlta(texto)) return this._iniciarAlta(chatId, telegramId);
      return TelegramService.enviarMensaje(
        chatId,
        "No estás registrado en Gestión de Obras TLC. Para solicitar acceso, seleccioná <b>Dar de alta</b>.",
        TelegramService.teclado([["Dar de alta"]])
      );
    }

    if (acceso.estado === "RECHAZADO") {
      if (this._esDarDeAlta(texto)) return this._iniciarAlta(chatId, telegramId);
      return TelegramService.enviarMensaje(
        chatId,
        "Tu solicitud anterior fue rechazada. Podés generar una nueva solicitud seleccionando <b>Dar de alta</b>.",
        TelegramService.teclado([["Dar de alta"]])
      );
    }

    if (acceso.estado === "PENDIENTE") {
      return TelegramService.enviarMensaje(
        chatId,
        `Tu solicitud está <b>pendiente de aprobación</b> desde ${this._fecha(acceso.usuario.FechaAlta)}.`,
        TelegramService.quitarTeclado()
      );
    }

    if (acceso.estado === "PENDIENTE_REACTIVACION") {
      return TelegramService.enviarMensaje(
        chatId,
        "Tu usuario está pendiente de reactivación. Tu rol y código de usuario se mantienen sin cambios.",
        TelegramService.quitarTeclado()
      );
    }

    if (acceso.estado === "ACCESO_OK") {
      return TelegramService.enviarMensaje(
        chatId,
        `Hola <b>${this._esc(acceso.usuario.Nombre)}</b>.\nRol: <b>${this._esc(acceso.usuario.RolAprobado)}</b>.`,
        TelegramService.quitarTeclado()
      );
    }

    return TelegramService.enviarMensaje(chatId, `Estado de acceso: ${this._esc(acceso.estado)}.`);
  }

  static _iniciarAlta(chatId, telegramId) {
    BLL_SesionTelegram.guardar(telegramId, "ALTA_NOMBRE", "", {});
    return TelegramService.enviarMensaje(
      chatId,
      "Vamos a generar tu solicitud de acceso.\n\nIngresá tu <b>nombre</b>:",
      TelegramService.teclado([["Cancelar"]])
    );
  }

  static _continuarAlta(chatId, telegramId, texto, estado) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);

    if (estado === "ALTA_NOMBRE") {
      const nombre = this._textoValido(texto, "nombre");
      contexto.nombre = nombre;
      BLL_SesionTelegram.guardar(telegramId, "ALTA_APELLIDO", "", contexto);
      return TelegramService.enviarMensaje(chatId, "Ahora ingresá tu <b>apellido</b>:", TelegramService.teclado([["Cancelar"]]));
    }

    if (estado === "ALTA_APELLIDO") {
      const apellido = this._textoValido(texto, "apellido");
      contexto.apellido = apellido;
      BLL_SesionTelegram.guardar(telegramId, "ALTA_ROL", "", contexto);
      return TelegramService.enviarMensaje(
        chatId,
        "Seleccioná el <b>rol solicitado</b>:",
        TelegramService.teclado([["Supervisor"], ["Gerente"], ["Director"], ["Cancelar"]])
      );
    }

    if (estado === "ALTA_ROL") {
      const rol = this._rolDesdeTexto(texto);
      if (!rol) {
        return TelegramService.enviarMensaje(
          chatId,
          "Seleccioná uno de los roles disponibles.",
          TelegramService.teclado([["Supervisor"], ["Gerente"], ["Director"], ["Cancelar"]])
        );
      }
      contexto.rol = rol;
      BLL_SesionTelegram.guardar(telegramId, "ALTA_CONFIRMAR", "", contexto);
      return TelegramService.enviarMensaje(
        chatId,
        `<b>Confirmá la solicitud</b>\n\nNombre: ${this._esc(contexto.nombre)}\nApellido: ${this._esc(contexto.apellido)}\nRol solicitado: ${this._esc(rol)}`,
        TelegramService.teclado([["Confirmar alta"], ["Cancelar"]])
      );
    }

    if (estado === "ALTA_CONFIRMAR") {
      if (this._normalizar(texto) !== "CONFIRMAR ALTA") {
        return TelegramService.enviarMensaje(
          chatId,
          "Para guardar la solicitud seleccioná <b>Confirmar alta</b> o <b>Cancelar</b>.",
          TelegramService.teclado([["Confirmar alta"], ["Cancelar"]])
        );
      }

      try {
        const usuario = BLL_Usuario.solicitarAlta(
          telegramId,
          contexto.nombre,
          contexto.apellido,
          contexto.rol
        );
        BLL_SesionTelegram.limpiar(telegramId);
        return TelegramService.enviarMensaje(
          chatId,
          `Solicitud registrada correctamente.\n\nEstado: <b>PENDIENTE DE APROBACIÓN</b>\nRol solicitado: <b>${this._esc(usuario.RolSolicitado)}</b>.`,
          TelegramService.quitarTeclado()
        );
      } catch (error) {
        BLL_SesionTelegram.limpiar(telegramId);
        return TelegramService.enviarMensaje(chatId, this._mensajeError(error), TelegramService.quitarTeclado());
      }
    }

    BLL_SesionTelegram.limpiar(telegramId);
    return this._mostrarAcceso(chatId, telegramId, "La conversación anterior no pudo recuperarse.");
  }

  static _mostrarAcceso(chatId, telegramId, prefijo) {
    const acceso = BLL_Usuario.registrarAcceso(telegramId);
    if (acceso.estado === "NO_REGISTRADO" || acceso.estado === "RECHAZADO") {
      return TelegramService.enviarMensaje(
        chatId,
        `${prefijo}\n\nSeleccioná <b>Dar de alta</b> para iniciar una solicitud.`,
        TelegramService.teclado([["Dar de alta"]])
      );
    }
    return TelegramService.enviarMensaje(chatId, prefijo, TelegramService.quitarTeclado());
  }

  static _textoValido(texto, campo) {
    const valor = String(texto || "").trim();
    if (!valor || valor.length < 2 || valor.length > 80 || valor.startsWith("/")) {
      throw new Error(`Ingresá un ${campo} válido.`);
    }
    return valor;
  }

  static _rolDesdeTexto(texto) {
    const t = this._normalizar(texto);
    if (t === "SUPERVISOR") return Config.ROLES.SUPERVISOR;
    if (t === "GERENTE") return Config.ROLES.GERENTE;
    if (t === "DIRECTOR") return Config.ROLES.DIRECTOR;
    return null;
  }

  static _esDarDeAlta(texto) { return this._normalizar(texto) === "DAR DE ALTA"; }
  static _esCancelar(texto) { return this._normalizar(texto) === "CANCELAR"; }
  static _normalizar(texto) { return String(texto || "").trim().toUpperCase(); }
  static _fecha(fecha) { return fecha ? Utilities.formatDate(new Date(fecha), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm") : "fecha no disponible"; }
  static _esc(valor) { return String(valor == null ? "" : valor).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  static _mensajeError(error) { return error && error.message ? `No se pudo registrar la solicitud: ${this._esc(error.message)}` : "No se pudo registrar la solicitud."; }
}
