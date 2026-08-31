// ======================================================
// MAP_OBRA.JS
// Traduce BE_Obra <-> fila de almacenamiento.
// ======================================================
class MAP_Obra { static BEaFila(x){return [x.CodigoObra,x.IdContratista,x.Familia,x.Activa];} static FilaaBE(f){return new BE_Obra(f[0],f[1],f[2],f[3]);} }
