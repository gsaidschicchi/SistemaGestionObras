// ======================================================
// DAL_USUARIO.GS
// Persistencia física de USUARIOS. Sin reglas de negocio.
// ======================================================
class DAL_Usuario {
  static buscarPorTelegramId(id){ return DAL_Base.buscarPrimero(Config.HOJAS.USUARIOS,12,f=>String(f[0])===String(id)); }
  static buscarPorCodUsuario(cod){ return DAL_Base.buscarPrimero(Config.HOJAS.USUARIOS,12,f=>String(f[5])===String(cod)); }
  static listar(){ return DAL_Base.filas(Config.HOJAS.USUARIOS,12); }
  static insertar(f){ DAL_Base.insertar(Config.HOJAS.USUARIOS,f); }
  static actualizar(n,f){ DAL_Base.actualizar(Config.HOJAS.USUARIOS,n,f); }
}
