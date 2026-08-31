// ======================================================
// BE_TIPIFICACION.JS
// Entidad de tipificación. Solo datos.
// ======================================================
class BE_Tipificacion { constructor(idTipificacion,familiaObra,categoria,descripcion,severidad,estadoTipificacion="ACTIVA",propuestaPor=null,fechaPropuesta=null,validadaPor=null,fechaValidacion=null){ Object.assign(this,{IdTipificacion:idTipificacion,FamiliaObra:familiaObra,Categoria:categoria,Descripcion:descripcion,Severidad:severidad,EstadoTipificacion:estadoTipificacion,PropuestaPor:propuestaPor,FechaPropuesta:fechaPropuesta,ValidadaPor:validadaPor,FechaValidacion:fechaValidacion}); } }
