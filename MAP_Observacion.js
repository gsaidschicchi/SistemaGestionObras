// ======================================================
// MAP_OBSERVACION.JS
// Traduce BE_Observacion <-> fila de almacenamiento.
// ======================================================
class MAP_Observacion { static BEaFila(x){return [x.IdObservacion,x.CodigoObra,x.CodUsuario,x.IdTipificacion,x.FechaHora,x.Latitud,x.Longitud,x.ReferenciaUbicacion,x.Comentario,x.Estado,x.FechaUltModificacion,x.CodUsuarioUltModificacion,x.FechaEliminacion,x.CodUsuarioEliminacion];} static FilaaBE(f){return new BE_Observacion(...f);} }
