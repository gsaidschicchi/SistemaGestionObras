// ======================================================
// MAP_TAREA.JS
// Traduce una fila del consolidado a BE_Tarea.
// No contiene reglas de clasificación.
// ======================================================
class MAP_Tarea {
  static FilaABE(fila, indices) {
    return new BE_Tarea(
      fila[indices.ticket],
      fila[indices.obra],
      fila[indices.estadoEC],
      fila[indices.estadoSupervision],
      fila[indices.estadoMateriales],
      indices.ultimaEC >= 0 ? fila[indices.ultimaEC] : ""
    );
  }
}
