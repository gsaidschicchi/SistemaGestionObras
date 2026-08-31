// ======================================================
// DAL_USUARIO.GS
// Gestiona el acceso físico a los datos de USUARIOS.
// Busca, inserta y actualiza registros en Google Sheets.
// No contiene reglas de negocio.
// ======================================================

class DAL_Usuario {

  // Busca un usuario por su Telegram ID.
  // Devuelve la fila completa o null si no existe.
  static buscarPorTelegramId(telegramId) {

    const hoja = DataSourceSheets.obtenerHoja(
      Config.HOJAS.USUARIOS
    );

    const ultimaFila = hoja.getLastRow();

    if (ultimaFila < 2) {
        return null;
      }

    const datos = hoja
      .getRange(2, 1, ultimaFila - 1, 12)
      .getValues();

    for (let i = 0; i < datos.length; i++) {

      if (String(datos[i][0]) === String(telegramId)) {

        return {
          fila: i + 2,
          datos: datos[i]
        };

      }
    }

    return null;
  }


  // Inserta un nuevo registro al final de USUARIOS.
  static insertar(filaUsuario) {

    const hoja = DataSourceSheets.obtenerHoja(
      Config.HOJAS.USUARIOS
    );

    hoja.appendRow(filaUsuario);
  }


  // Reemplaza los datos de un usuario existente.
  static actualizar(numeroFila, filaUsuario) {

    const hoja = DataSourceSheets.obtenerHoja(
      Config.HOJAS.USUARIOS
    );

    hoja
      .getRange(numeroFila, 1, 1, filaUsuario.length)
      .setValues([filaUsuario]);
  }

}