// ======================================================
// TELEGRAMSERVICE.JS
// Integración técnica con Telegram.
// ======================================================
class TelegramService {
  static token(){return PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");}
  static enviarMensaje(chatId,texto,replyMarkup=null){const token=this.token();if(!token)throw new Error("Falta BOT_TOKEN en Script Properties.");const payload={chat_id:String(chatId),text:texto,parse_mode:"HTML"};if(replyMarkup)payload.reply_markup=JSON.stringify(replyMarkup);return UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:"post",payload,muteHttpExceptions:true});}
}
