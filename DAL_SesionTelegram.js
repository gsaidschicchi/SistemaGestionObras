// ======================================================
// DAL_SESIONTELEGRAM.JS
// Persistencia física de SESIONTELEGRAM. Sin reglas de negocio.
// ======================================================
class DAL_SesionTelegram {
  static buscarPorTelegramId(id){return DAL_Base.buscarPrimero(Config.HOJAS.SESIONES_TELEGRAM,5,f=>String(f[0])===String(id));}
  static insertar(f){DAL_Base.insertar(Config.HOJAS.SESIONES_TELEGRAM,f);} static actualizar(n,f){DAL_Base.actualizar(Config.HOJAS.SESIONES_TELEGRAM,n,f);}
}
