// ======================================================
// BLL_OBRA.JS
// Reglas de búsqueda y clasificación de obra.
// ======================================================
class BLL_Obra {
  static determinarFamilia(codigo){const c=String(codigo).toUpperCase();if(c.includes("OC"))return Config.FAMILIAS_OBRA.OC;if(c.includes("FO"))return Config.FAMILIAS_OBRA.FO;if(/[A-Z]F$/.test(c))return Config.FAMILIAS_OBRA.FTTH;return null;}
  static buscar(texto,repo=null){repo=repo||DAL_Obra;exigir(String(texto||"").trim(),"BUSQUEDA_VACIA","Debe indicar una obra.");return repo.buscarTexto(texto).slice(0,3).map(r=>MAP_Obra.FilaaBE(r.datos));}
  static obtener(codigo,repo=null){repo=repo||DAL_Obra;const r=repo.buscarPorCodigo(codigo);return r?MAP_Obra.FilaaBE(r.datos):null;}
}
