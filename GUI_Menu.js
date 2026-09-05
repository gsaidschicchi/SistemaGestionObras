// ======================================================
// GUI_MENU.JS
// Menú de módulos según permisos resueltos por BLL_Usuario.
// Solo expone módulos ya implementados en el sistema.
// ======================================================
class GUI_Menu {
  static procesar(chatId, telegramId, texto, usuario, sesion = null, mensaje = null) {
    const estado = sesion ? String(sesion.EstadoConversacion || "") : "";

    // Si existe un flujo de supervisión en curso, revalida el permiso antes de delegar.
    if (estado.startsWith("SUP_") || estado.startsWith("OBS_") || estado.startsWith("REP_")) {
      BLL_Usuario.exigirPermiso(usuario.RolAprobado, Config.MODULOS.SUPERVISION_OBRA);
      return GUI_Supervision.procesar(chatId, telegramId, texto, usuario, sesion, mensaje);
    }

    const opcion = this._normalizar(texto);

    if (opcion === "SUPERVISION DE OBRA") {
      BLL_Usuario.exigirPermiso(usuario.RolAprobado, Config.MODULOS.SUPERVISION_OBRA);
      BLL_SesionTelegram.limpiar(telegramId);
      return GUI_Supervision.procesar(chatId, telegramId, "", usuario, null, mensaje);
    }

    // El menú interno de CU01 no persiste un estado conversacional mientras
    // espera una de estas tres opciones. Por eso GUI_Menu debe reconocerlas
    // y volver a delegarlas a GUI_Supervision.
    const opcionesSupervision = [
      "INICIAR NUEVA SUPERVISION",
      "SUPERVISIONES EN CURSO",
      "SUPERVISIONES FINALIZADAS"
    ];
    if (opcionesSupervision.includes(opcion)) {
      BLL_Usuario.exigirPermiso(usuario.RolAprobado, Config.MODULOS.SUPERVISION_OBRA);
      return GUI_Supervision.procesar(chatId, telegramId, texto, usuario, sesion, mensaje);
    }

    return this.mostrar(chatId, usuario);
  }

  static mostrar(chatId, usuario) {
    const permitidos = BLL_Usuario.obtenerModulosPermitidos(usuario.RolAprobado)
      .filter(m => Config.MODULOS_DISPONIBLES.includes(m));
    const botones = [];
    if (permitidos.includes(Config.MODULOS.SUPERVISION_OBRA)) botones.push(["Supervisión de Obra"]);

    const saludo = `Hola <b>${this._esc(usuario.Nombre)}</b>.\nRol: <b>${this._esc(usuario.RolAprobado)}</b>.`;
    const texto = botones.length ? `${saludo}\n\n¿Qué querés hacer?` : `${saludo}\n\nNo tenés módulos disponibles actualmente.`;
    return TelegramService.enviarMensaje(chatId, texto, botones.length ? TelegramService.teclado(botones) : TelegramService.quitarTeclado());
  }

  static _normalizar(texto) { return String(texto || "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(); }
  static _esc(valor) { return String(valor == null ? "" : valor).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
}
