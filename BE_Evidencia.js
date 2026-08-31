// ======================================================
// BE_EVIDENCIA.JS
// Entidad de evidencia. Solo datos.
// ======================================================
class BE_Evidencia { constructor(idEvidencia,idObservacion,tipo,nombreArchivo,driveFileId,fechaHora,estado=Config.ESTADOS_REGISTRO.ACTIVA){ Object.assign(this,{IdEvidencia:idEvidencia,IdObservacion:idObservacion,Tipo:tipo,NombreArchivo:nombreArchivo,DriveFileId:driveFileId,FechaHora:fechaHora,Estado:estado}); } }
