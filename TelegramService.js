// ======================================================
// TELEGRAMSERVICE.JS
// Integración técnica con Telegram.
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

  static descargarArchivo(fileId) {
    const token = this.token();
    if (!token) throw new Error("Falta TELEGRAM_BOT_TOKEN en Script Properties.");

    const info = UrlFetchApp.fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`,
      { muteHttpExceptions: true }
    );

    if (info.getResponseCode() !== 200) {
      throw new Error("No se pudo obtener la evidencia desde Telegram.");
    }

    const json = JSON.parse(info.getContentText());
    if (!json.ok || !json.result || !json.result.file_path) {
      throw new Error("Telegram no devolvió la ruta de la evidencia.");
    }

    const filePath = json.result.file_path;
    const archivo = UrlFetchApp.fetch(
      `https://api.telegram.org/file/bot${token}/${filePath}`,
      { muteHttpExceptions: true }
    );

    if (archivo.getResponseCode() !== 200) {
      throw new Error("No se pudo descargar la evidencia desde Telegram.");
    }

    return {
      blob: archivo.getBlob(),
      filePath: filePath
    };
  }

  static enviarDocumento(chatId, driveFileId, nombreArchivo) {
    const token = this.token();
    if (!token) throw new Error("Falta TELEGRAM_BOT_TOKEN en Script Properties.");
    const blob = DriveApp.getFileById(driveFileId).getBlob().setName(nombreArchivo);
    const respuesta = UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "post", payload: { chat_id: String(chatId), document: blob }, muteHttpExceptions: true
    });
    const codigo = respuesta.getResponseCode();
    if (codigo < 200 || codigo >= 300) throw new Error(`Telegram respondió HTTP ${codigo} al enviar el PDF.`);
    return respuesta;
  }

  static teclado(filas) {
    return {
      keyboard: filas,
      resize_keyboard: true,
      one_time_keyboard: false
    };
  }

  static tecladoUbicacion() {
    return this.teclado([
      [{ text: "Compartir ubicación", request_location: true }],
      ["Ingresar referencia"],
      ["Cancelar observación"]
    ]);
  }

  static quitarTeclado() {
    return { remove_keyboard: true };
  }
}
