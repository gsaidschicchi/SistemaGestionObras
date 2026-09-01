// ======================================================
// BLL_SUPERVISION.JS
// Reglas de inicio, consulta y finalización de supervisión.
// ======================================================
class BLL_Supervision {

  // ======================================================
  // INICIO DE SUPERVISIÓN
  // ScriptLock protege la validación e inserción para evitar
  // altas simultáneas de una supervisión sobre la misma obra.
  // ======================================================

  static iniciar(
    codigoObra,
    codUsuario,
    confirmado,
    deps = null,
    ahora = new Date()
  ) {
    const depsRecibidas = !!deps;

    deps = deps || {
      obras: DAL_Obra,
      supervisiones: DAL_Supervision
    };

    exigir(
      confirmado,
      "INICIO_NO_CONFIRMADO",
      "Debe confirmar el inicio."
    );

    exigir(
      codUsuario,
      "USUARIO_REQUERIDO",
      "Debe existir un usuario responsable."
    );

    let obra = null;

    if (depsRecibidas) {
      const ro =
        deps.obras.buscarPorCodigo(codigoObra);

      obra = ro
        ? MAP_Obra.FilaaBE(ro.datos)
        : null;
    } else {
      obra =
        BLL_Obra.obtener(codigoObra);
    }

    exigir(
      obra,
      "OBRA_NO_EXISTE",
      "La obra no existe."
    );

    exigir(
      obra.Activa !== Config.ACTIVO.NO,
      "OBRA_INACTIVA",
      "La obra está inactiva."
    );


    // ------------------------------------------------------
    // QA / repositorios en memoria
    // No utiliza LockService.
    // ------------------------------------------------------

    if (depsRecibidas) {
      return this._iniciarInterno(
        codigoObra,
        codUsuario,
        obra,
        deps,
        ahora,
        false
      );
    }


    // ------------------------------------------------------
    // PRODUCCIÓN
    // Protege la validación final y la inserción.
    // ------------------------------------------------------

    const lock =
      LockService.getScriptLock();

    lock.waitLock(10000);

    try {
      return this._iniciarInterno(
        codigoObra,
        codUsuario,
        obra,
        deps,
        ahora,
        true
      );
    } finally {
      lock.releaseLock();
    }
  }


  // ======================================================
  // LÓGICA INTERNA DE INICIO
  // ======================================================

  static _iniciarInterno(
    codigoObra,
    codUsuario,
    obra,
    deps,
    ahora,
    asegurarObraLocal
  ) {

    const rs =
      deps.supervisiones.buscarPorObra(
        codigoObra
      );

    if (rs) {
      const existente =
        MAP_Supervision.FilaaBE(
          rs.datos
        );

      if (
        existente.Estado ===
        Config.ESTADOS_SUPERVISION.EN_CURSO
      ) {
        return {
          existente: true,
          supervision: existente
        };
      }

      throw new ErrorNegocio(
        "SUPERVISION_FINALIZADA",
        "La obra ya posee una supervisión finalizada."
      );
    }


    // ------------------------------------------------------
    // Persistencia local de la obra.
    //
    // Se realiza dentro del lock para evitar altas paralelas
    // de la misma obra durante el inicio de supervisión.
    // ------------------------------------------------------

    if (asegurarObraLocal) {
      obra =
        BLL_Obra.asegurarLocal(obra);
    }


    const supervision =
      new BE_Supervision(
        codigoObra,
        ahora,
        null,
        Config.ESTADOS_SUPERVISION.EN_CURSO,
        codUsuario,
        null
      );

    deps.supervisiones.insertar(
      MAP_Supervision.BEaFila(
        supervision
      )
    );

    return {
      existente: false,
      supervision: supervision
    };
  }


  // ======================================================
  // FINALIZACIÓN DE SUPERVISIÓN
  // ScriptLock protege la lectura y actualización del estado
  // ante finalizaciones simultáneas.
  // ======================================================

  static finalizar(
    codigoObra,
    codUsuario,
    confirmado,
    repo = null,
    ahora = new Date()
  ) {
    const repoRecibido = !!repo;

    repo =
      repo || DAL_Supervision;

    exigir(
      confirmado,
      "FINALIZACION_NO_CONFIRMADA",
      "Debe confirmar la finalización."
    );

    exigir(
      codUsuario,
      "USUARIO_REQUERIDO",
      "Debe existir un usuario responsable."
    );


    // ------------------------------------------------------
    // QA / repositorio inyectado
    // ------------------------------------------------------

    if (repoRecibido) {
      return this._finalizarInterno(
        codigoObra,
        codUsuario,
        repo,
        ahora
      );
    }


    // ------------------------------------------------------
    // PRODUCCIÓN
    // ------------------------------------------------------

    const lock =
      LockService.getScriptLock();

    lock.waitLock(10000);

    try {
      return this._finalizarInterno(
        codigoObra,
        codUsuario,
        repo,
        ahora
      );
    } finally {
      lock.releaseLock();
    }
  }


  // ======================================================
  // LÓGICA INTERNA DE FINALIZACIÓN
  // ======================================================

  static _finalizarInterno(
    codigoObra,
    codUsuario,
    repo,
    ahora
  ) {

    const r =
      repo.buscarPorObra(codigoObra);

    exigir(
      r,
      "SUPERVISION_NO_EXISTE",
      "No existe supervisión."
    );

    const supervision =
      MAP_Supervision.FilaaBE(
        r.datos
      );

    exigir(
      supervision.Estado ===
        Config.ESTADOS_SUPERVISION.EN_CURSO,
      "SUPERVISION_FINALIZADA",
      "La supervisión ya está finalizada."
    );

    supervision.Estado =
      Config.ESTADOS_SUPERVISION.FINALIZADA;

    supervision.FechaFinalizacion =
      ahora;

    supervision.CodUsuarioFinalizacion =
      codUsuario;

    repo.actualizar(
      r.fila,
      MAP_Supervision.BEaFila(
        supervision
      )
    );

    return supervision;
  }


  // ======================================================
  // CONSULTAS
  // ======================================================

  static obtener(
    codigoObra,
    repo = null
  ) {
    repo =
      repo || DAL_Supervision;

    const r =
      repo.buscarPorObra(codigoObra);

    return r
      ? MAP_Supervision.FilaaBE(
          r.datos
        )
      : null;
  }


  static listarEnCurso(
    repo = null
  ) {
    repo =
      repo || DAL_Supervision;

    return repo
      .listarPorEstado(
        Config.ESTADOS_SUPERVISION.EN_CURSO
      )
      .map(
        r =>
          MAP_Supervision.FilaaBE(
            r.datos
          )
      );
  }


  static listarFinalizadas(
    repo = null
  ) {
    repo =
      repo || DAL_Supervision;

    return repo
      .listarPorEstado(
        Config.ESTADOS_SUPERVISION.FINALIZADA
      )
      .map(
        r =>
          MAP_Supervision.FilaaBE(
            r.datos
          )
      );
  }
}