// ======================================================
// TEST_USUARIO.GS
// Prueba temporal del alta de usuario sin utilizar Telegram.
// ======================================================

function testSolicitarAltaUsuario() {

  const usuario = BLL_Usuario.solicitarAlta(
    "8763588756",
    "Gerardo",
    "Said",
    Config.ROLES.SUPERVISOR
  );

  Logger.log(usuario);
}

// ======================================================
// TEST: BUSCAR USUARIO
// Comprueba que un registro almacenado pueda recuperarse
// y convertirse nuevamente en un BE_Usuario.
// ======================================================

function testBuscarUsuario() {

  const registro = DAL_Usuario.buscarPorTelegramId("8763588756");

  if (registro === null) {
    throw new Error("Usuario no encontrado.");
  }

  const usuario = MAP_Usuario.FilaaBE(registro.datos);

  Logger.log(usuario);
}