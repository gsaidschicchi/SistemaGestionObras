// ======================================================
// BLL_SESIONTELEGRAM.JS
// Reglas de sesión conversacional y contexto temporal.
// ======================================================
class BLL_SesionTelegram {
  static obtener(id,repo=null){repo=repo||DAL_SesionTelegram;const r=repo.buscarPorTelegramId(id);return r?MAP_SesionTelegram.FilaaBE(r.datos):null;}
  static guardar(id,estado,codigoObra,contexto,repo=null,ahora=new Date()){repo=repo||DAL_SesionTelegram;const r=repo.buscarPorTelegramId(id);const s=new BE_SesionTelegram(id,estado||"",codigoObra||"",contexto?JSON.stringify(contexto):"",ahora);if(r)repo.actualizar(r.fila,MAP_SesionTelegram.BEaFila(s));else repo.insertar(MAP_SesionTelegram.BEaFila(s));return s;}
  static contexto(id,repo=null){const s=this.obtener(id,repo);if(!s||!s.ContextoFlujo)return {};try{return JSON.parse(s.ContextoFlujo);}catch(e){return {};}}
  static limpiar(id,repo=null,ahora=new Date()){return this.guardar(id,"","",null,repo,ahora);}
}
