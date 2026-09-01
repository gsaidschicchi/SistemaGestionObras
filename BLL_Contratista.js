// ======================================================
// BLL_CONTRATISTA.JS
// Reglas de resolución y alta automática de contratistas.
// ======================================================
class BLL_Contratista {
  static obtenerPorId(id, repo = null) {
    repo = repo || DAL_Contratista;
    const r = repo.buscarPorId(id);
    return r ? MAP_Contratista.FilaaBE(r.datos) : null;
  }

  static obtenerPorLocalizador(localizador, repo = null) {
    repo = repo || DAL_Contratista;
    const r = repo.buscarPorLocalizador(localizador);
    return r ? MAP_Contratista.FilaaBE(r.datos) : null;
  }

  static resolverOCrear(localizador, repo = null) {
    repo = repo || DAL_Contratista;
    const loc = String(localizador || "").trim().toUpperCase();
    if (!loc) return null;

    const existente = this.obtenerPorLocalizador(loc, repo);
    if (existente) return existente;

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const relectura = this.obtenerPorLocalizador(loc, repo);
      if (relectura) return relectura;

      let max = 0;
      repo.listar().forEach(f => {
        const m = String(f[0] || "").match(/^CON(\d+)$/i);
        if (m) max = Math.max(max, Number(m[1]) || 0);
      });

      const contratista = new BE_Contratista(
        `CON${String(max + 1).padStart(3, "0")}`,
        loc,
        loc,
        Config.ACTIVO.SI
      );
      repo.insertar(MAP_Contratista.BEaFila(contratista));
      return contratista;
    } finally {
      lock.releaseLock();
    }
  }
}
