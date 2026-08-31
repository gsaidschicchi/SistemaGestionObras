// ======================================================
// MAP_REPORTE.JS
// Traduce BE_Reporte <-> fila de almacenamiento.
// ======================================================
class MAP_Reporte { static BEaFila(x){return [x.IdReporte,x.CodigoObra,x.Version,x.FechaGeneracion,x.CodUsuarioGenerador,x.NombreArchivo,x.DriveFileId,x.Estado];} static FilaaBE(f){return new BE_Reporte(...f);} }
