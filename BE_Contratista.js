// ======================================================
// BE_CONTRATISTA.JS
// Entidad de contratista. Solo datos.
// ======================================================
class BE_Contratista {
  constructor(idContratista,nombre,activo=Config.ACTIVO.SI){ this.IdContratista=idContratista; this.Nombre=nombre; this.Activo=activo; }
}
