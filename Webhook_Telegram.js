// ======================================================
// WEBHOOK_TELEGRAM.JS
// Punto de entrada HTTP del bot de Telegram.
// ======================================================

function doPost(e) {
  const inicio = Date.now();
  let updateId = null;

  try {
    const contenido =
      e && e.postData && e.postData.contents
        ? e.postData.contents
        : "";

    if (!contenido) {
      return HtmlService.createHtmlOutput("OK");
    }

    const update = JSON.parse(contenido);

    updateId =
      update.update_id !== undefined &&
      update.update_id !== null
        ? String(update.update_id)
        : null;

    if (
      updateId &&
      Webhook_TelegramUpdate.yaProcesado(updateId)
    ) {
      console.log(
        `[WEBHOOK] update duplicado ignorado: ${updateId}`
      );

      return HtmlService.createHtmlOutput("OK");
    }

    GUI_Telegram.procesar(update);

    if (updateId) {
      Webhook_TelegramUpdate.marcarProcesado(updateId);
    }

    console.log(
      `[WEBHOOK] update=${updateId || "s/id"} total_ms=${
        Date.now() - inicio
      }`
    );

    return HtmlService.createHtmlOutput("OK");

  } catch (error) {
    console.error(
      `[WEBHOOK] update=${updateId || "s/id"} error=${
        error && error.stack
          ? error.stack
          : error
      }`
    );

    return HtmlService.createHtmlOutput("OK");
  }
}


// ======================================================
// CONTROL DE UPDATES DUPLICADOS
// ======================================================

class Webhook_TelegramUpdate {

  static _clave(updateId) {
    return `TG_UPDATE_${updateId}`;
  }

  static yaProcesado(updateId) {
    return (
      CacheService
        .getScriptCache()
        .get(this._clave(updateId)) === "1"
    );
  }

  static marcarProcesado(updateId) {
    CacheService
      .getScriptCache()
      .put(
        this._clave(updateId),
        "1",
        21600
      );
  }
}


// ======================================================
// CONFIGURACIÓN DEL WEBHOOK
// ======================================================

function configurarWebhookTelegram() {
  const token =
    PropertiesService
      .getScriptProperties()
      .getProperty("TELEGRAM_BOT_TOKEN");

  if (!token) {
    throw new Error(
      "No existe TELEGRAM_BOT_TOKEN"
    );
  }

  const webAppUrl =
    "https://script.google.com/macros/s/AKfycbwlPbsKPtJAIrva96q7mHUfqeljGwrupSHy41Wu6vp7rKPFflN5jXwqR3X_8k7rQ3xnsg/exec";

  const url =
    "https://api.telegram.org/bot" +
    token +
    "/setWebhook";

  const respuesta =
    UrlFetchApp.fetch(
      url,
      {
        method: "post",
        payload: {
          url: webAppUrl,
          drop_pending_updates: "true"
        },
        muteHttpExceptions: true
      }
    );

  console.log(
    respuesta.getContentText()
  );
}


// ======================================================
// ESTADO DEL WEBHOOK
// ======================================================

function estadoWebhookTelegram() {
  const token =
    PropertiesService
      .getScriptProperties()
      .getProperty("TELEGRAM_BOT_TOKEN");

  if (!token) {
    throw new Error(
      "No existe TELEGRAM_BOT_TOKEN"
    );
  }

  const url =
    "https://api.telegram.org/bot" +
    token +
    "/getWebhookInfo";

  const respuesta =
    UrlFetchApp.fetch(
      url,
      {
        muteHttpExceptions: true
      }
    );

  console.log(
    respuesta.getContentText()
  );
}