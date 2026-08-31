// ======================================================
// WEBHOOK_TELEGRAM.JS
// Punto de entrada HTTP del bot de Telegram.
// ======================================================
function doPost(e){try{const upd=JSON.parse(e.postData.contents);GUI_Telegram.procesar(upd);}catch(err){console.error(err);}return ContentService.createTextOutput("OK");}
