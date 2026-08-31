// ======================================================
// GUI_TELEGRAM.JS
// Entrada de interacción Telegram. Delega reglas a BLL.
// ======================================================
class GUI_Telegram {
  static procesar(update){const m=update.message||update.callback_query?.message;if(!m)return;const chatId=m.chat.id;const tgId=String(update.message?.from?.id||update.callback_query?.from?.id||"");const texto=(update.message?.text||update.callback_query?.data||"").trim();const acceso=BLL_Usuario.registrarAcceso(tgId);
    if(acceso.estado==="NO_REGISTRADO")return TelegramService.enviarMensaje(chatId,"Usuario no registrado. Utilice /alta Nombre Apellido ROL.");
    if(acceso.estado!=="ACCESO_OK")return TelegramService.enviarMensaje(chatId,`Estado de acceso: ${acceso.estado}.`);
    return TelegramService.enviarMensaje(chatId,`Hola ${acceso.usuario.Nombre}. Rol: ${acceso.usuario.RolAprobado}.`);
  }
}
