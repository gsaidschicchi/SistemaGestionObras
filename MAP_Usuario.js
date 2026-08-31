// ======================================================
// MAP_USUARIO.GS
// Convierte datos entre la estructura de almacenamiento
// y objetos BE_Usuario.
// No contiene reglas de negocio ni accede a Google Sheets.
// ======================================================

class MAP_Usuario {

  // Convierte un objeto BE_Usuario en un array.
  // El orden coincide con las columnas de la hoja USUARIOS.
  static BEaFila(usuario) {

    return [
      usuario.TelegramId,
      usuario.Nombre,
      usuario.Apellido,
      usuario.RolSolicitado,
      usuario.RolAprobado,
      usuario.CodUsuario,
      usuario.EstadoAprobacion,
      usuario.Activo,
      usuario.FechaAlta,
      usuario.FechaAprobacion,
      usuario.AprobadoPor,
      usuario.UltimoAcceso
    ];

  }


  // Convierte una fila obtenida del almacenamiento
  // nuevamente en un objeto BE_Usuario.
  static FilaaBE(fila) {

    return new BE_Usuario(
      fila[0],   // TELEGRAM_ID
      fila[1],   // NOMBRE
      fila[2],   // APELLIDO
      fila[3],   // ROL_SOLICITADO
      fila[4],   // ROL_APROBADO
      fila[5],   // COD_USUARIO
      fila[6],   // ESTADO_APROBACION
      fila[7],   // ACTIVO
      fila[8],   // FECHA_ALTA
      fila[9],   // FECHA_APROBACION
      fila[10],  // APROBADO_POR
      fila[11]   // ULTIMO_ACCESO
    );

  }

}