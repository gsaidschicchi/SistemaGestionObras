// ======================================================
// TELEGRAMSERVICE.JS
// Integración técnica con Telegram.
// Envía las respuestas mediante Bot API.
// ======================================================
class TelegramService {
  static token() {
    return PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  }

  static enviarMensaje(chatId, texto, replyMarkup = null) {
    const token = this.token();
    if (!token) throw new Error("Falta TELEGRAM_BOT_TOKEN en Script Properties.");

    const payload = {
      chat_id: String(chatId),
      text: texto,
      parse_mode: "HTML"
    };

    if (replyMarkup) payload.reply_markup = JSON.stringify(replyMarkup);

    const respuesta = UrlFetchApp.fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "post",
        payload,
        muteHttpExceptions: true
      }
    );

    const codigo = respuesta.getResponseCode();
    if (codigo < 200 || codigo >= 300) {
      throw new Error(`Telegram respondió HTTP ${codigo}: ${respuesta.getContentText()}`);
    }

    return respuesta;
  }

  static teclado(filas) {
    return {
      keyboard: filas,
      resize_keyboard: true,
      one_time_keyboard: false
    };
  }

  static quitarTeclado() {
    return { remove_keyboard: true };
  }
}
