// ======================================================
// BE_USUARIO.JS
// Entidad de usuario. Solo datos, sin reglas de negocio.
// ======================================================
class BE_Usuario {
  constructor(telegramId,nombre,apellido,rolSolicitado,rolAprobado=null,codUsuario=null,estadoAprobacion=null,activo=null,fechaAlta=null,fechaAprobacion=null,aprobadoPor=null,ultimoAcceso=null){
    this.TelegramId=String(telegramId); this.Nombre=nombre; this.Apellido=apellido; this.RolSolicitado=rolSolicitado; this.RolAprobado=rolAprobado; this.CodUsuario=codUsuario; this.EstadoAprobacion=estadoAprobacion; this.Activo=activo; this.FechaAlta=fechaAlta; this.FechaAprobacion=fechaAprobacion; this.AprobadoPor=aprobadoPor; this.UltimoAcceso=ultimoAcceso;
  }
}
