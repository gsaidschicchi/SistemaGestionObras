// ======================================================
// DAL_TIPIFICACION.JS
// Persistencia física de TIPIFICACION. Sin reglas de negocio.
// ======================================================
class DAL_Tipificacion {
  static buscarPorId(id){return DAL_Base.buscarPrimero(Config.HOJAS.TIPIFICACIONES,10,f=>String(f[0])===String(id));}
  static listarActivasPorFamilia(fam){return DAL_Base.buscarTodos(Config.HOJAS.TIPIFICACIONES,10,f=>f[1]===fam&&f[5]==="ACTIVA");}
}
