// ======================================================
// BE_OBSERVACION.JS
// Entidad de observación. Solo datos.
// ======================================================
class BE_Observacion { constructor(idObservacion,codigoObra,codUsuario,idTipificacion,fechaHora,latitud=null,longitud=null,referenciaUbicacion="",comentario="",estado=Config.ESTADOS_REGISTRO.ACTIVA,fechaUltModificacion=null,codUsuarioUltModificacion=null,fechaEliminacion=null,codUsuarioEliminacion=null){ Object.assign(this,{IdObservacion:idObservacion,CodigoObra:codigoObra,CodUsuario:codUsuario,IdTipificacion:idTipificacion,FechaHora:fechaHora,Latitud:latitud,Longitud:longitud,ReferenciaUbicacion:referenciaUbicacion,Comentario:comentario,Estado:estado,FechaUltModificacion:fechaUltModificacion,CodUsuarioUltModificacion:codUsuarioUltModificacion,FechaEliminacion:fechaEliminacion,CodUsuarioEliminacion:codUsuarioEliminacion}); } }
