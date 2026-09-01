// ======================================================
// BLL_OBRA.JS
// Reglas de búsqueda, normalización y clasificación de obra.
// ======================================================
class BLL_Obra {
  static normalizarBusqueda(texto) {
    return String(texto || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  static determinarFamilia(codigo) {
    const c = String(codigo || "").toUpperCase();
    if (c.includes("OC")) return Config.FAMILIAS_OBRA.OC;
    if (c.includes("FO")) return Config.FAMILIAS_OBRA.FO;
    if (/[A-Z]F(?:$|[^A-Z0-9])/.test(c)) return Config.FAMILIAS_OBRA.FTTH;
    return null;
  }

  static buscar(texto, repo = null) {
    repo = repo || DAL_Obra;
    const busqueda = this.normalizarBusqueda(texto);
    exigir(busqueda, "BUSQUEDA_VACIA", "Debe indicar una obra.");

    // En producción consulta el catálogo rápido pm_obras_validas de BigQuery.
    // En QA conserva compatibilidad con repositorios en memoria.
    if (typeof repo.buscarExternasPorPrefijo === "function") {
      const filas = repo.buscarExternasPorPrefijo(busqueda);
      const obras = filas
        .map(f => {
          const codigo = f && f.f && f.f[0] ? String(f.f[0].v || "").trim() : "";
          return MAP_Obra.BigQueryFilaABE(f, this.determinarFamilia(codigo));
        })
        .filter(Boolean);

      const unicas = [];
      const vistos = new Set();
      obras.forEach(obra => {
        const clave = this.normalizarBusqueda(obra.CodigoObra);
        if (!vistos.has(clave)) {
          vistos.add(clave);
          unicas.push(obra);
        }
      });
      return unicas;
    }

    return repo.buscarTexto(texto).map(r => MAP_Obra.FilaaBE(r.datos));
  }

  static obtener(codigo, repo = null) {
    repo = repo || DAL_Obra;

    const local = repo.buscarPorCodigo(codigo);
    if (local) return MAP_Obra.FilaaBE(local.datos);

    if (typeof repo.buscarExternaPorCodigo === "function") {
      const normalizado = this.normalizarBusqueda(codigo);
      if (!normalizado) return null;
      const fila = repo.buscarExternaPorCodigo(normalizado);
      if (!fila) return null;
      return MAP_Obra.BigQueryFilaABE(fila, this.determinarFamilia(codigo));
    }

    return null;
  }
}
