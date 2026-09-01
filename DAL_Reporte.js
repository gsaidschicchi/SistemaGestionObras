// ======================================================
// DAL_REPORTE.JS
// Persistencia física de REPORTE. Sin reglas de negocio.
// ======================================================
class DAL_Reporte {
  static listarPorObra(c){return DAL_Base.buscarTodos(Config.HOJAS.REPORTES,9,f=>String(f[1]).toUpperCase()===String(c).toUpperCase());}
  static insertar(f){return DAL_Base.insertar(Config.HOJAS.REPORTES,f);}
  static actualizar(n,f){DAL_Base.actualizar(Config.HOJAS.REPORTES,n,f);}
}
