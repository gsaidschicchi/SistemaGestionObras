// ======================================================
// MAP_USUARIO.JS
// Traduce BE_Usuario <-> fila de almacenamiento.
// ======================================================
class MAP_Usuario {
  static BEaFila(u){ return [String(u.TelegramId),u.Nombre,u.Apellido,u.RolSolicitado,u.RolAprobado,u.CodUsuario,u.EstadoAprobacion,u.Activo,u.FechaAlta,u.FechaAprobacion,u.AprobadoPor,u.UltimoAcceso]; }
  static FilaaBE(f){ return new BE_Usuario(String(f[0]),f[1],f[2],f[3],f[4]||null,f[5]||null,f[6]||null,f[7]||null,f[8]||null,f[9]||null,f[10]||null,f[11]||null); }
}
