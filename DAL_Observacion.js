// ======================================================
// DAL_OBSERVACION.JS
// Persistencia física de OBSERVACION. Sin reglas de negocio.
// ======================================================
class DAL_Observacion {
  static buscarPorId(id){return DAL_Base.buscarPrimero(Config.HOJAS.OBSERVACIONES,14,f=>String(f[0])===String(id));}
  static listarPorObra(c,soloActivas=false){return DAL_Base.buscarTodos(Config.HOJAS.OBSERVACIONES,14,f=>String(f[1]).toUpperCase()===String(c).toUpperCase()&&(!soloActivas||f[9]===Config.ESTADOS_REGISTRO.ACTIVA));}
  static listar(){return DAL_Base.filas(Config.HOJAS.OBSERVACIONES,14);} static insertar(f){DAL_Base.insertar(Config.HOJAS.OBSERVACIONES,f);} static actualizar(n,f){DAL_Base.actualizar(Config.HOJAS.OBSERVACIONES,n,f);}
}
