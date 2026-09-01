// ======================================================
// BE_CONTRATISTA.JS
// Entidad de contratista. Solo datos.
// ======================================================
class BE_Contratista {
  constructor(idContratista, localizadorDestino, nombreContratista, activo=Config.ACTIVO.SI) {
    this.IdContratista = idContratista;
    this.LocalizadorDestino = localizadorDestino;
    this.NombreContratista = nombreContratista;
    this.Activo = activo;
  }
}
