// ======================================================
// MAP_OBRA.JS
// Traduce estructuras de almacenamiento <-> BE_Obra.
// ======================================================
class MAP_Obra {
  static BEaFila(x) {
    return [x.CodigoObra, x.IdContratista, x.Familia, x.Activa];
  }

  static FilaaBE(f) {
    return new BE_Obra(f[0], f[1], f[2], f[3]);
  }

  static BigQueryFilaABE(fila, familia = null) {
    const codigo = fila && fila.f && fila.f[0]
      ? String(fila.f[0].v || "").trim()
      : "";

    if (!codigo) return null;
    return new BE_Obra(codigo, "", familia, Config.ACTIVO.SI);
  }
}
