// ======================================================
// DAL_EVIDENCIA.JS
// Persistencia física de EVIDENCIA. Sin reglas de negocio.
// ======================================================
class DAL_Evidencia {
  static listarPorObservacion(id){return DAL_Base.buscarTodos(Config.HOJAS.EVIDENCIAS,7,f=>String(f[1])===String(id));}
  static listar(){return DAL_Base.filas(Config.HOJAS.EVIDENCIAS,7);} static insertar(f){DAL_Base.insertar(Config.HOJAS.EVIDENCIAS,f);} static actualizar(n,f){DAL_Base.actualizar(Config.HOJAS.EVIDENCIAS,n,f);}
}
