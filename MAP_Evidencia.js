// ======================================================
// MAP_EVIDENCIA.JS
// Traduce BE_Evidencia <-> fila de almacenamiento.
// ======================================================
class MAP_Evidencia { static BEaFila(x){return [x.IdEvidencia,x.IdObservacion,x.Tipo,x.NombreArchivo,x.DriveFileId,x.FechaHora,x.Estado];} static FilaaBE(f){return new BE_Evidencia(...f);} }
