// ======================================================
// BE_REPORTE.JS
// Entidad de reporte. Solo datos.
// ======================================================
class BE_Reporte {
  constructor(idReporte,codigoObra,version,fechaGeneracion,codUsuarioGenerador,comentarioGeneral,nombreArchivo,driveFileId,estado=Config.ESTADOS_REPORTE.VIGENTE){
    Object.assign(this,{IdReporte:idReporte,CodigoObra:codigoObra,Version:version,FechaGeneracion:fechaGeneracion,CodUsuarioGenerador:codUsuarioGenerador,ComentarioGeneral:comentarioGeneral||"",NombreArchivo:nombreArchivo,DriveFileId:driveFileId,Estado:estado});
  }
}
