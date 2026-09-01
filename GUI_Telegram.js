// ======================================================
// GUI_TELEGRAM.JS
// Punto de enrutamiento de la interacción de Telegram.
// ======================================================
class GUI_Telegram {
  static procesar(update) {
    const mensaje = update.message;
    if (!mensaje) return;

    const chatId = mensaje.chat.id;
    const telegramId = String(mensaje.from.id);
    const texto = String(mensaje.text || "").trim();

    return GUI_Usuario.procesar(chatId, telegramId, texto, mensaje);
  }
}
