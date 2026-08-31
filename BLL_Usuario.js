// ======================================================
// BLL_USUARIO.GS
// Contiene las reglas de negocio relacionadas con usuarios.
// Coordina BE, MAP y DAL.
// ======================================================

class BLL_Usuario {

  // Registra una nueva solicitud de alta.
  // No permite duplicar usuarios por Telegram ID.
  static solicitarAlta(telegramId, nombre, apellido, rolSolicitado) {

    // Verificar si el usuario ya existe
    const registroExistente =
      DAL_Usuario.buscarPorTelegramId(telegramId);

    if (registroExistente !== null) {
      throw new Error("El usuario ya se encuentra registrado.");
    }


    // Validar que el rol solicitado sea válido para un alta pública
    const rolesPermitidos = [
      Config.ROLES.SUPERVISOR,
      Config.ROLES.GERENTE,
      Config.ROLES.DIRECTOR
    ];

    if (!rolesPermitidos.includes(rolSolicitado)) {
      throw new Error("El rol solicitado no es válido.");
    }


    // Crear la entidad con el estado inicial correspondiente
    const usuario = new BE_Usuario(
      telegramId,
      nombre,
      apellido,
      rolSolicitado,
      null,
      null,
      Config.ESTADOS_APROBACION.PENDIENTE,
      Config.ACTIVO.NO,
      new Date(),
      null,
      null,
      null
    );


    // Convertir la entidad a una estructura almacenable
    const filaUsuario = MAP_Usuario.BEaFila(usuario);


    // Persistir el usuario
    DAL_Usuario.insertar(filaUsuario);


    // Devolver la entidad creada
    return usuario;
  }

}