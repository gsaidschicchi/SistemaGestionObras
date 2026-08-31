// ======================================================
// BLL_TIPIFICACION.JS
// Consulta de tipificaciones activas y por identificador.
// ======================================================
class BLL_Tipificacion {
  static listarActivasPorFamilia(familia,repo=null){
    repo=repo||DAL_Tipificacion;
    return repo.listarActivasPorFamilia(familia).map(r=>MAP_Tipificacion.FilaaBE(r.datos));
  }
  static obtener(id,repo=null){
    repo=repo||DAL_Tipificacion; const r=repo.buscarPorId(id); return r?MAP_Tipificacion.FilaaBE(r.datos):null;
  }
}
