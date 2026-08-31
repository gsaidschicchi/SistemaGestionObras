// ======================================================
// MAP_SESIONTELEGRAM.JS
// Traduce BE_SesionTelegram <-> fila de almacenamiento.
// ======================================================
class MAP_SesionTelegram { static BEaFila(x){return [String(x.TelegramId),x.EstadoConversacion,x.CodigoObraActiva,x.ContextoFlujo,x.UltimaInteraccion];} static FilaaBE(f){return new BE_SesionTelegram(...f);} }
