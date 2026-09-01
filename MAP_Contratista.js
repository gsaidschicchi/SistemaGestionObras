// ======================================================
// MAP_CONTRATISTA.JS
// Traduce BE_Contratista <-> fila de almacenamiento.
// ======================================================
class MAP_Contratista {
  static BEaFila(x) { return [x.IdContratista, x.LocalizadorDestino, x.NombreContratista, x.Activo]; }
  static FilaaBE(f) { return new BE_Contratista(f[0], f[1], f[2], f[3]); }
}
