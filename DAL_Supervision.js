// ======================================================
// DAL_SUPERVISION.JS
// Persistencia física de SUPERVISION. Sin reglas de negocio.
// ======================================================
class DAL_Supervision {
  static buscarPorObra(c){return DAL_Base.buscarPrimero(Config.HOJAS.SUPERVISIONES,6,f=>String(f[0]).toUpperCase()===String(c).toUpperCase());}
  static listarPorEstado(e){return DAL_Base.buscarTodos(Config.HOJAS.SUPERVISIONES,6,f=>f[3]===e);}
  static insertar(f){DAL_Base.insertar(Config.HOJAS.SUPERVISIONES,f);} static actualizar(n,f){DAL_Base.actualizar(Config.HOJAS.SUPERVISIONES,n,f);}
}
