// ======================================================
// MAP_TIPIFICACION.JS
// Traduce BE_Tipificacion <-> fila de almacenamiento.
// ======================================================
class MAP_Tipificacion { static BEaFila(x){return [x.IdTipificacion,x.FamiliaObra,x.Categoria,x.Descripcion,x.Severidad,x.EstadoTipificacion,x.PropuestaPor,x.FechaPropuesta,x.ValidadaPor,x.FechaValidacion];} static FilaaBE(f){return new BE_Tipificacion(...f);} }
