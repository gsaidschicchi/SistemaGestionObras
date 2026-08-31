// ======================================================
// BE_OBRA.JS
// Entidad de obra. Solo datos.
// ======================================================
class BE_Obra { constructor(codigoObra,idContratista,familia,activa=Config.ACTIVO.SI){ this.CodigoObra=codigoObra; this.IdContratista=idContratista; this.Familia=familia; this.Activa=activa; } }
