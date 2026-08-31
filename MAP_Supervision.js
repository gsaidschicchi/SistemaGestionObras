// ======================================================
// MAP_SUPERVISION.JS
// Traduce BE_Supervision <-> fila de almacenamiento.
// ======================================================
class MAP_Supervision { static BEaFila(x){return [x.CodigoObra,x.FechaInicio,x.FechaFinalizacion,x.Estado,x.CodUsuarioInicio,x.CodUsuarioFinalizacion];} static FilaaBE(f){return new BE_Supervision(f[0],f[1],f[2],f[3],f[4],f[5]);} }
