// ======================================================
// BE_SESIONTELEGRAM.JS
// Entidad de sesión conversacional de Telegram. Solo datos.
// ======================================================
class BE_SesionTelegram { constructor(telegramId,estadoConversacion="",codigoObraActiva="",contextoFlujo="",ultimaInteraccion=null){ Object.assign(this,{TelegramId:String(telegramId),EstadoConversacion:estadoConversacion,CodigoObraActiva:codigoObraActiva,ContextoFlujo:contextoFlujo,UltimaInteraccion:ultimaInteraccion}); } }
