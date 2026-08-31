// ======================================================
// DAL_OBRA.JS
// Persistencia física de OBRA. Sin reglas de negocio.
// ======================================================
class DAL_Obra {
  static buscarPorCodigo(c){return DAL_Base.buscarPrimero(Config.HOJAS.OBRAS,4,f=>String(f[0]).toUpperCase()===String(c).toUpperCase());}
  static buscarTexto(t){t=String(t).toUpperCase();return DAL_Base.buscarTodos(Config.HOJAS.OBRAS,4,f=>String(f[0]).toUpperCase().includes(t));}
  static insertar(f){DAL_Base.insertar(Config.HOJAS.OBRAS,f);}
}
