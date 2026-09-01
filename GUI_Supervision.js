// ======================================================
// GUI_SUPERVISION.JS
// Flujo conversacional CU01: supervisión y observaciones.
// ======================================================
class GUI_Supervision {
  static procesar(chatId, telegramId, texto, usuario, sesion = null, mensaje = null) {
    sesion = sesion || BLL_SesionTelegram.obtener(telegramId);
    const estado = sesion ? String(sesion.EstadoConversacion || "") : "";

    if (this._esCancelarObservacion(texto) && estado.startsWith("OBS_")) {
      const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();
      BLL_SesionTelegram.guardar(telegramId, "SUP_OBRA_ACTIVA", codigoObra, {});
      const supervision = BLL_Supervision.obtener(codigoObra);
      return this._mostrarObraActiva(chatId, supervision, "Observación cancelada.");
    }

    if (this._esVolverMenu(texto)) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipal(chatId, usuario);
    }

    if (!estado) return this._procesarMenuPrincipal(chatId, telegramId, texto, usuario);
    if (estado === "SUP_BUSCAR_OBRA") return this._buscarObra(chatId, telegramId, texto, usuario);
    if (estado === "SUP_SELECCIONAR_OBRA") return this._seleccionarObra(chatId, telegramId, texto, usuario);
    if (estado === "SUP_CONFIRMAR_INICIO") return this._confirmarInicio(chatId, telegramId, texto, usuario);
    if (estado === "SUP_SELECCIONAR_EN_CURSO") return this._seleccionarEnCurso(chatId, telegramId, texto, usuario);
    if (estado === "SUP_SELECCIONAR_FINALIZADA") return this._seleccionarFinalizada(chatId, telegramId, texto, usuario);
    if (estado === "SUP_OBRA_ACTIVA") return this._procesarObraActiva(chatId, telegramId, texto, usuario, sesion);
    if (estado === "SUP_CONFIRMAR_FINALIZACION") return this._confirmarFinalizacion(chatId, telegramId, texto, usuario, sesion);

    if (estado === "OBS_TIPIFICACION") return this._seleccionarTipificacion(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_UBICACION") return this._recibirUbicacion(chatId, telegramId, texto, usuario, sesion, mensaje);
    if (estado === "OBS_REFERENCIA") return this._recibirReferencia(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_FOTO") return this._recibirFoto(chatId, telegramId, texto, usuario, sesion, mensaje);
    if (estado === "OBS_FOTO_ACCION") return this._procesarAccionFoto(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_COMENTARIO_DECISION") return this._procesarDecisionComentario(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_COMENTARIO") return this._recibirComentario(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_CONFIRMAR") return this._confirmarObservacion(chatId, telegramId, texto, usuario, sesion);

    if (estado === "OBS_VER_SELECCIONAR") return this._seleccionarObservacion(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_DETALLE") return this._procesarDetalleObservacion(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_EDIT_MENU") return this._procesarMenuEdicion(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_EDIT_TIPIFICACION") return this._editarTipificacion(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_EDIT_OTROS_COMENTARIO") return this._editarOtrosComentario(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_EDIT_UBICACION") return this._editarUbicacion(chatId, telegramId, texto, usuario, sesion, mensaje);
    if (estado === "OBS_EDIT_REFERENCIA") return this._editarReferencia(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_EDIT_COMENTARIO") return this._editarComentario(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_EDIT_FOTO") return this._recibirFotoEdicion(chatId, telegramId, texto, usuario, sesion, mensaje);
    if (estado === "OBS_EDIT_FOTO_ACCION") return this._procesarAccionFotoEdicion(chatId, telegramId, texto, usuario, sesion);
    if (estado === "OBS_ELIMINAR_CONFIRMAR") return this._confirmarEliminarObservacion(chatId, telegramId, texto, usuario, sesion);

    BLL_SesionTelegram.limpiar(telegramId);
    return this._mostrarMenuPrincipalCompacto(chatId, usuario, "La conversación anterior no pudo recuperarse.");
  }

  static _procesarMenuPrincipal(chatId, telegramId, texto, usuario) {
    const opcion = this._normalizar(texto);

    if (opcion === "INICIAR NUEVA SUPERVISION") {
      BLL_SesionTelegram.guardar(telegramId, "SUP_BUSCAR_OBRA", "", {});
      return TelegramService.enviarMensaje(
        chatId,
        "Ingresá el <b>código de obra</b> o una parte del código:",
        TelegramService.teclado([["Volver al menú"]])
      );
    }

    if (opcion === "SUPERVISIONES EN CURSO") return this._mostrarSupervisionesEnCurso(chatId, telegramId, usuario);
    if (opcion === "SUPERVISIONES FINALIZADAS") return this._mostrarSupervisionesFinalizadas(chatId, telegramId, usuario);
    return this._mostrarMenuPrincipal(chatId, usuario);
  }

  static _buscarObra(chatId, telegramId, texto, usuario) {
    try {
      const obras = BLL_Obra.buscar(texto);
      if (!obras.length) {
        return TelegramService.enviarMensaje(chatId, "No encontré obras con ese código. Probá nuevamente.", TelegramService.teclado([["Volver al menú"]]));
      }
      if (obras.length === 1) return this._prepararConfirmacionObra(chatId, telegramId, obras[0], usuario);

      const codigos = obras.map(x => x.CodigoObra);
      BLL_SesionTelegram.guardar(telegramId, "SUP_SELECCIONAR_OBRA", "", { coincidencias: codigos });
      return TelegramService.enviarMensaje(
        chatId,
        "Encontré varias obras. Seleccioná una:",
        TelegramService.teclado([...codigos.map(x => [x]), ["Volver al menú"]])
      );
    } catch (error) {
      return TelegramService.enviarMensaje(chatId, this._mensajeError(error), TelegramService.teclado([["Volver al menú"]]));
    }
  }

  static _seleccionarObra(chatId, telegramId, texto, usuario) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigo = String(texto || "").trim().toUpperCase();
    const coincidencias = Array.isArray(contexto.coincidencias) ? contexto.coincidencias : [];

    if (!coincidencias.includes(codigo)) {
      return TelegramService.enviarMensaje(chatId, "Seleccioná una de las obras encontradas.", TelegramService.teclado([...coincidencias.map(x => [x]), ["Volver al menú"]]));
    }

    const obra = BLL_Obra.obtener(codigo);
    if (!obra) {
      BLL_SesionTelegram.guardar(telegramId, "SUP_BUSCAR_OBRA", "", {});
      return TelegramService.enviarMensaje(chatId, "La obra seleccionada ya no está disponible. Ingresá nuevamente el código.", TelegramService.teclado([["Volver al menú"]]));
    }
    return this._prepararConfirmacionObra(chatId, telegramId, obra, usuario);
  }

  static _prepararConfirmacionObra(chatId, telegramId, obra, usuario) {
    BLL_SesionTelegram.guardar(telegramId, "SUP_CONFIRMAR_INICIO", obra.CodigoObra, { codigoObra: obra.CodigoObra });
    return TelegramService.enviarMensaje(
      chatId,
      `<b>Confirmar inicio de supervisión</b>\n\nObra: <b>${this._esc(obra.CodigoObra)}</b>\nFamilia: <b>${this._mostrarValor(obra.Familia)}</b>`,
      TelegramService.teclado([["Iniciar supervisión"], ["Volver al menú"]])
    );
  }

  static _confirmarInicio(chatId, telegramId, texto, usuario) {
    if (this._normalizar(texto) !== "INICIAR SUPERVISION") {
      return TelegramService.enviarMensaje(chatId, "Para comenzar seleccioná <b>Iniciar supervisión</b>.", TelegramService.teclado([["Iniciar supervisión"], ["Volver al menú"]]));
    }

    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(contexto.codigoObra || "").trim().toUpperCase();

    try {
      const resultado = BLL_Supervision.iniciar(codigoObra, usuario.CodUsuario, true);
      BLL_SesionTelegram.guardar(telegramId, "SUP_OBRA_ACTIVA", codigoObra, {});
      const prefijo = resultado.existente ? "La obra ya tenía una supervisión en curso. La dejamos como obra activa." : "Supervisión iniciada correctamente.";
      return this._mostrarObraActiva(chatId, resultado.supervision, prefijo);
    } catch (error) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipalCompacto(chatId, usuario, this._mensajeError(error));
    }
  }

  static _procesarObraActiva(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();

    if (opcion === "REPORTAR OBSERVACION") return this._iniciarObservacion(chatId, telegramId, usuario, codigoObra);
    if (opcion === "VER OBSERVACIONES") return this._mostrarObservaciones(chatId, telegramId, usuario, codigoObra);

    if (opcion === "FINALIZAR SUPERVISION") {
      return this._prepararFinalizacion(chatId, telegramId, usuario, codigoObra);
    }

    const supervision = codigoObra ? BLL_Supervision.obtener(codigoObra) : null;
    if (!supervision) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipalCompacto(chatId, usuario, "No pude recuperar la supervisión activa.");
    }
    return this._mostrarObraActiva(chatId, supervision);
  }


  static _prepararFinalizacion(chatId, telegramId, usuario, codigoObra) {
    try {
      const supervision = BLL_Supervision.obtener(codigoObra);
      if (!supervision || supervision.Estado !== Config.ESTADOS_SUPERVISION.EN_CURSO) {
        BLL_SesionTelegram.limpiar(telegramId);
        return this._mostrarMenuPrincipalCompacto(chatId, usuario, "La supervisión ya no está en curso.");
      }

      const cantidadObservaciones = BLL_Observacion.listarActivas(codigoObra).length;
      BLL_SesionTelegram.guardar(telegramId, "SUP_CONFIRMAR_FINALIZACION", codigoObra, { cantidadObservaciones: cantidadObservaciones });

      const detalleObservaciones = cantidadObservaciones === 0
        ? "No se registraron observaciones activas. La supervisión puede finalizar igualmente."
        : `Observaciones activas: <b>${cantidadObservaciones}</b>`;

      return TelegramService.enviarMensaje(
        chatId,
        `<b>Finalizar supervisión</b>\n\nObra: <b>${this._esc(codigoObra)}</b>\nInicio: ${this._fecha(supervision.FechaInicio)}\n${detalleObservaciones}\n\n¿Confirmás la finalización de la supervisión?`,
        TelegramService.teclado([["Confirmar finalización"], ["Cancelar"]])
      );
    } catch (error) {
      return TelegramService.enviarMensaje(chatId, this._mensajeError(error), this._tecladoObraActiva());
    }
  }

  static _confirmarFinalizacion(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();

    if (opcion === "CANCELAR") {
      BLL_SesionTelegram.guardar(telegramId, "SUP_OBRA_ACTIVA", codigoObra, {});
      const supervision = BLL_Supervision.obtener(codigoObra);
      return this._mostrarObraActiva(chatId, supervision, "Finalización cancelada.");
    }

    if (opcion !== "CONFIRMAR FINALIZACION") {
      return TelegramService.enviarMensaje(
        chatId,
        "Seleccioná <b>Confirmar finalización</b> o <b>Cancelar</b>.",
        TelegramService.teclado([["Confirmar finalización"], ["Cancelar"]])
      );
    }

    try {
      const cantidadObservaciones = BLL_Observacion.listarActivas(codigoObra).length;
      const supervision = BLL_Supervision.finalizar(codigoObra, usuario.CodUsuario, true);
      BLL_SesionTelegram.limpiar(telegramId);

      const detalle = cantidadObservaciones === 0
        ? "Resultado: <b>recorrida sin observaciones</b>"
        : `Observaciones activas: <b>${cantidadObservaciones}</b>`;

      return TelegramService.enviarMensaje(
        chatId,
        `<b>Supervisión finalizada correctamente.</b>\n\nObra: <b>${this._esc(supervision.CodigoObra)}</b>\nInicio: ${this._fecha(supervision.FechaInicio)}\nFinalización: ${this._fecha(supervision.FechaFinalizacion)}\n${detalle}`,
        TelegramService.teclado([["Volver al menú"]])
      );
    } catch (error) {
      const supervision = BLL_Supervision.obtener(codigoObra);
      if (supervision && supervision.Estado === Config.ESTADOS_SUPERVISION.EN_CURSO) {
        BLL_SesionTelegram.guardar(telegramId, "SUP_OBRA_ACTIVA", codigoObra, {});
        return this._mostrarObraActiva(chatId, supervision, this._mensajeError(error));
      }
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipalCompacto(chatId, usuario, this._mensajeError(error));
    }
  }

  static _iniciarObservacion(chatId, telegramId, usuario, codigoObra) {
    try {
      const obra = BLL_Obra.obtener(codigoObra);
      if (!obra) throw new Error("No se encontró la obra activa.");

      const tipificaciones = BLL_Tipificacion.listarActivasPorFamilia(obra.Familia);
      if (!tipificaciones.length) {
        return TelegramService.enviarMensaje(chatId, "No hay tipificaciones activas para esta familia de obra.", this._tecladoObraActiva());
      }

      const opciones = tipificaciones.map(t => ({
        id: t.IdTipificacion,
        descripcion: t.Descripcion,
        categoria: t.Categoria
      }));

      BLL_SesionTelegram.guardar(telegramId, "OBS_TIPIFICACION", codigoObra, {
        tipificaciones: opciones,
        fotos: []
      });

      return TelegramService.enviarMensaje(
        chatId,
        `<b>Nueva observación</b>\nObra: <b>${this._esc(codigoObra)}</b>\n\nSeleccioná la tipificación:`,
        TelegramService.teclado([...opciones.map(x => [x.descripcion]), ["Cancelar observación"]])
      );
    } catch (error) {
      return TelegramService.enviarMensaje(chatId, this._mensajeError(error), this._tecladoObraActiva());
    }
  }

  static _seleccionarTipificacion(chatId, telegramId, texto, usuario, sesion) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const opcion = this._normalizar(texto);
    const tipificaciones = Array.isArray(contexto.tipificaciones) ? contexto.tipificaciones : [];
    const seleccionada = tipificaciones.find(x => this._normalizar(x.descripcion) === opcion);

    if (!seleccionada) {
      return TelegramService.enviarMensaje(chatId, "Seleccioná una de las tipificaciones disponibles.", TelegramService.teclado([...tipificaciones.map(x => [x.descripcion]), ["Cancelar observación"]]));
    }

    contexto.idTipificacion = seleccionada.id;
    contexto.tipificacionDescripcion = seleccionada.descripcion;
    contexto.tipificacionCategoria = seleccionada.categoria;
    BLL_SesionTelegram.guardar(telegramId, "OBS_UBICACION", sesion.CodigoObraActiva, contexto);

    return TelegramService.enviarMensaje(
      chatId,
      "Compartí la ubicación de la observación o ingresá una referencia manual.",
      TelegramService.tecladoUbicacion()
    );
  }

  static _recibirUbicacion(chatId, telegramId, texto, usuario, sesion, mensaje) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);

    if (mensaje && mensaje.location) {
      contexto.latitud = mensaje.location.latitude;
      contexto.longitud = mensaje.location.longitude;
      contexto.referenciaUbicacion = "";
      BLL_SesionTelegram.guardar(telegramId, "OBS_FOTO", sesion.CodigoObraActiva, contexto);
      return this._pedirFoto(chatId);
    }

    if (this._normalizar(texto) === "INGRESAR REFERENCIA") {
      BLL_SesionTelegram.guardar(telegramId, "OBS_REFERENCIA", sesion.CodigoObraActiva, contexto);
      return TelegramService.enviarMensaje(chatId, "Ingresá calle, altura o una referencia clara de ubicación:", TelegramService.teclado([["Cancelar observación"]]));
    }

    return TelegramService.enviarMensaje(chatId, "Usá <b>Compartir ubicación</b> o seleccioná <b>Ingresar referencia</b>.", TelegramService.tecladoUbicacion());
  }

  static _recibirReferencia(chatId, telegramId, texto, usuario, sesion) {
    const referencia = String(texto || "").trim();
    if (referencia.length < 3) {
      return TelegramService.enviarMensaje(chatId, "Ingresá una referencia de ubicación válida.", TelegramService.teclado([["Cancelar observación"]]));
    }

    const contexto = BLL_SesionTelegram.contexto(telegramId);
    contexto.latitud = null;
    contexto.longitud = null;
    contexto.referenciaUbicacion = referencia;
    BLL_SesionTelegram.guardar(telegramId, "OBS_FOTO", sesion.CodigoObraActiva, contexto);
    return this._pedirFoto(chatId);
  }

  static _pedirFoto(chatId) {
    return TelegramService.enviarMensaje(chatId, "Enviá una <b>foto</b> como evidencia de la observación.", TelegramService.teclado([["Cancelar observación"]]));
  }

  static _recibirFoto(chatId, telegramId, texto, usuario, sesion, mensaje) {
    const fotos = mensaje && Array.isArray(mensaje.photo) ? mensaje.photo : [];
    if (!fotos.length) {
      return TelegramService.enviarMensaje(chatId, "Necesito una foto enviada desde Telegram para continuar.", TelegramService.teclado([["Cancelar observación"]]));
    }

    const foto = fotos[fotos.length - 1];
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    contexto.fotos = Array.isArray(contexto.fotos) ? contexto.fotos : [];
    contexto.fotos.push(foto.file_id);
    BLL_SesionTelegram.guardar(telegramId, "OBS_FOTO_ACCION", sesion.CodigoObraActiva, contexto);

    return TelegramService.enviarMensaje(
      chatId,
      `Foto recibida. Evidencias cargadas: <b>${contexto.fotos.length}</b>.`,
      TelegramService.teclado([["Agregar otra foto"], ["Continuar"], ["Cancelar observación"]])
    );
  }

  static _procesarAccionFoto(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const contexto = BLL_SesionTelegram.contexto(telegramId);

    if (opcion === "AGREGAR OTRA FOTO") {
      BLL_SesionTelegram.guardar(telegramId, "OBS_FOTO", sesion.CodigoObraActiva, contexto);
      return this._pedirFoto(chatId);
    }

    if (opcion === "CONTINUAR") {
      BLL_SesionTelegram.guardar(telegramId, "OBS_COMENTARIO_DECISION", sesion.CodigoObraActiva, contexto);
      return TelegramService.enviarMensaje(chatId, "¿Querés agregar un comentario?", TelegramService.teclado([["Sí"], ["No"], ["Cancelar observación"]]));
    }

    return TelegramService.enviarMensaje(chatId, "Seleccioná <b>Agregar otra foto</b> o <b>Continuar</b>.", TelegramService.teclado([["Agregar otra foto"], ["Continuar"], ["Cancelar observación"]]));
  }

  static _procesarDecisionComentario(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const contexto = BLL_SesionTelegram.contexto(telegramId);

    if (opcion === "SI") {
      BLL_SesionTelegram.guardar(telegramId, "OBS_COMENTARIO", sesion.CodigoObraActiva, contexto);
      return TelegramService.enviarMensaje(chatId, "Ingresá el comentario:", TelegramService.teclado([["Cancelar observación"]]));
    }

    if (opcion === "NO") {
      if (this._normalizar(contexto.tipificacionDescripcion) === "OTROS") {
        BLL_SesionTelegram.guardar(telegramId, "OBS_COMENTARIO", sesion.CodigoObraActiva, contexto);
        return TelegramService.enviarMensaje(chatId, "La tipificación <b>OTROS</b> requiere un comentario. Ingresalo:", TelegramService.teclado([["Cancelar observación"]]));
      }
      contexto.comentario = "";
      return this._mostrarResumenObservacion(chatId, telegramId, sesion.CodigoObraActiva, contexto);
    }

    return TelegramService.enviarMensaje(chatId, "Seleccioná <b>Sí</b> o <b>No</b>.", TelegramService.teclado([["Sí"], ["No"], ["Cancelar observación"]]));
  }

  static _recibirComentario(chatId, telegramId, texto, usuario, sesion) {
    const comentario = String(texto || "").trim();
    if (comentario.length < 2) {
      return TelegramService.enviarMensaje(chatId, "Ingresá un comentario válido.", TelegramService.teclado([["Cancelar observación"]]));
    }

    const contexto = BLL_SesionTelegram.contexto(telegramId);
    contexto.comentario = comentario;
    return this._mostrarResumenObservacion(chatId, telegramId, sesion.CodigoObraActiva, contexto);
  }

  static _mostrarResumenObservacion(chatId, telegramId, codigoObra, contexto) {
    BLL_SesionTelegram.guardar(telegramId, "OBS_CONFIRMAR", codigoObra, contexto);

    const ubicacion = contexto.latitud !== null && contexto.latitud !== undefined
      ? `${contexto.latitud}, ${contexto.longitud}`
      : this._esc(contexto.referenciaUbicacion || "-");
    const comentario = contexto.comentario ? this._esc(contexto.comentario) : "Sin comentario";
    const fotos = Array.isArray(contexto.fotos) ? contexto.fotos.length : 0;

    return TelegramService.enviarMensaje(
      chatId,
      `<b>Confirmar observación</b>\n\nObra: <b>${this._esc(codigoObra)}</b>\nTipificación: <b>${this._esc(contexto.tipificacionDescripcion)}</b>\nUbicación: ${ubicacion}\nFotos: <b>${fotos}</b>\nComentario: ${comentario}`,
      TelegramService.teclado([["Confirmar observación"], ["Cancelar observación"]])
    );
  }

  static _confirmarObservacion(chatId, telegramId, texto, usuario, sesion) {
    if (this._normalizar(texto) !== "CONFIRMAR OBSERVACION") {
      return TelegramService.enviarMensaje(chatId, "Seleccioná <b>Confirmar observación</b> o <b>Cancelar observación</b>.", TelegramService.teclado([["Confirmar observación"], ["Cancelar observación"]]));
    }

    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();

    try {
      const resultado = BLL_Observacion.registrarConEvidencias(
        {
          codigoObra: codigoObra,
          codUsuario: usuario.CodUsuario,
          idTipificacion: contexto.idTipificacion,
          latitud: contexto.latitud ?? null,
          longitud: contexto.longitud ?? null,
          referenciaUbicacion: contexto.referenciaUbicacion || "",
          comentario: contexto.comentario || ""
        },
        contexto.fotos || [],
        true
      );

      BLL_SesionTelegram.guardar(telegramId, "SUP_OBRA_ACTIVA", codigoObra, {});
      const supervision = BLL_Supervision.obtener(codigoObra);
      return this._mostrarObraActiva(chatId, supervision, `Observación registrada correctamente. ID: <b>${this._esc(resultado.observacion.IdObservacion)}</b>.`);
    } catch (error) {
      return TelegramService.enviarMensaje(chatId, `No se pudo registrar la observación: ${this._mensajeError(error)}`, TelegramService.teclado([["Confirmar observación"], ["Cancelar observación"]]));
    }
  }


  static _mostrarObservaciones(chatId, telegramId, usuario, codigoObra, mensajeEstado = "") {
    try {
      const observaciones = BLL_Observacion.listarActivas(codigoObra);
      if (!observaciones.length) {
        BLL_SesionTelegram.guardar(telegramId, "SUP_OBRA_ACTIVA", codigoObra, {});
        const supervision = BLL_Supervision.obtener(codigoObra);
        return this._mostrarObraActiva(chatId, supervision, mensajeEstado || "No hay observaciones activas para esta obra.");
      }

      const opciones = observaciones.map((o, i) => {
        const tip = BLL_Tipificacion.obtener(o.IdTipificacion);
        const descripcion = tip ? tip.Descripcion : o.IdTipificacion;
        return {
          id: o.IdObservacion,
          label: `${String(i + 1).padStart(2, "0")} · ${descripcion} · ${this._fechaCorta(o.FechaHora)}`
        };
      });

      BLL_SesionTelegram.guardar(telegramId, "OBS_VER_SELECCIONAR", codigoObra, { observaciones: opciones });
      const encabezado = `${mensajeEstado ? `${mensajeEstado}\n\n` : ""}<b>Observaciones activas</b>\nObra: <b>${this._esc(codigoObra)}</b>\n\nSeleccioná una observación:`;
      return TelegramService.enviarMensaje(
        chatId,
        encabezado,
        TelegramService.teclado([...opciones.map(x => [x.label]), ["Volver a la obra"], ["Volver al menú"]])
      );
    } catch (error) {
      return TelegramService.enviarMensaje(chatId, this._mensajeError(error), this._tecladoObraActiva());
    }
  }

  static _seleccionarObservacion(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();

    if (opcion === "VOLVER A LA OBRA") {
      BLL_SesionTelegram.guardar(telegramId, "SUP_OBRA_ACTIVA", codigoObra, {});
      return this._mostrarObraActiva(chatId, BLL_Supervision.obtener(codigoObra));
    }

    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const opciones = Array.isArray(contexto.observaciones) ? contexto.observaciones : [];
    const seleccionada = opciones.find(x => this._normalizar(x.label) === opcion);
    if (!seleccionada) {
      return TelegramService.enviarMensaje(chatId, "Seleccioná una de las observaciones disponibles.", TelegramService.teclado([...opciones.map(x => [x.label]), ["Volver a la obra"], ["Volver al menú"]]));
    }

    return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, seleccionada.id);
  }

  static _mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, idObservacion, mensajeEstado = "") {
    const observacion = BLL_Observacion.obtener(idObservacion);
    if (!observacion || observacion.Estado !== Config.ESTADOS_REGISTRO.ACTIVA) {
      return this._mostrarObservaciones(chatId, telegramId, usuario, codigoObra, "La observación seleccionada ya no está activa.");
    }

    const tip = BLL_Tipificacion.obtener(observacion.IdTipificacion);
    const descripcion = tip ? tip.Descripcion : observacion.IdTipificacion;
    const ubicacion = this._ubicacionObservacion(observacion);
    const comentario = observacion.Comentario ? this._esc(observacion.Comentario) : "Sin comentario";
    const autor = this._nombreUsuario(observacion.CodUsuario);
    const cantidadFotos = BLL_Observacion.contarEvidenciasActivas(observacion.IdObservacion);

    BLL_SesionTelegram.guardar(telegramId, "OBS_DETALLE", codigoObra, { idObservacion: observacion.IdObservacion });

    const mensaje = `${mensajeEstado ? `${mensajeEstado}\n\n` : ""}<b>Observación</b>\nID: <b>${this._esc(observacion.IdObservacion)}</b>\nTipificación: <b>${this._esc(descripcion)}</b>\nFecha: ${this._fecha(observacion.FechaHora)}\nAutor: <b>${this._esc(autor)}</b>\nUbicación: ${ubicacion}\nFotos: <b>${cantidadFotos}</b>\nComentario: ${comentario}`;
    return TelegramService.enviarMensaje(
      chatId,
      mensaje,
      TelegramService.teclado([["Editar"], ["Eliminar"], ["Volver a observaciones"], ["Volver a la obra"]])
    );
  }

  static _procesarDetalleObservacion(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();
    const id = contexto.idObservacion;

    if (opcion === "VOLVER A OBSERVACIONES") return this._mostrarObservaciones(chatId, telegramId, usuario, codigoObra);
    if (opcion === "VOLVER A LA OBRA") {
      BLL_SesionTelegram.guardar(telegramId, "SUP_OBRA_ACTIVA", codigoObra, {});
      return this._mostrarObraActiva(chatId, BLL_Supervision.obtener(codigoObra));
    }
    if (opcion === "EDITAR") return this._mostrarMenuEdicion(chatId, telegramId, codigoObra, id);
    if (opcion === "ELIMINAR") {
      const observacion = BLL_Observacion.obtener(id);
      const tip = observacion ? BLL_Tipificacion.obtener(observacion.IdTipificacion) : null;
      const descripcion = tip ? tip.Descripcion : (observacion ? observacion.IdTipificacion : "-");
      const ubicacion = observacion ? this._ubicacionObservacion(observacion) : "-";
      const comentario = observacion && observacion.Comentario ? this._esc(observacion.Comentario) : "Sin comentario";

      BLL_SesionTelegram.guardar(telegramId, "OBS_ELIMINAR_CONFIRMAR", codigoObra, { idObservacion: id });
      return TelegramService.enviarMensaje(
        chatId,
        `<b>Eliminar observación</b>\n\nID: <b>${this._esc(id)}</b>\nTipificación: <b>${this._esc(descripcion)}</b>\nUbicación: ${ubicacion}\nComentario: ${comentario}\n\n¿Confirmás eliminar esta observación?`,
        TelegramService.teclado([["Confirmar eliminación"], ["Cancelar"]])
      );
    }

    return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, id);
  }

  static _mostrarMenuEdicion(chatId, telegramId, codigoObra, idObservacion, mensajeEstado = "") {
    BLL_SesionTelegram.guardar(telegramId, "OBS_EDIT_MENU", codigoObra, { idObservacion });
    return TelegramService.enviarMensaje(
      chatId,
      `${mensajeEstado ? `${mensajeEstado}\n\n` : ""}<b>Editar observación</b>\n¿Qué querés modificar?`,
      TelegramService.teclado([["Tipificación"], ["Ubicación"], ["Comentario"], ["Fotos"], ["Volver al detalle"]])
    );
  }

  static _procesarMenuEdicion(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();
    const id = contexto.idObservacion;

    if (opcion === "VOLVER AL DETALLE") return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, id);

    if (opcion === "TIPIFICACION") {
      const obra = BLL_Obra.obtener(codigoObra);
      const tips = BLL_Tipificacion.listarActivasPorFamilia(obra.Familia).map(t => ({ id: t.IdTipificacion, descripcion: t.Descripcion }));
      BLL_SesionTelegram.guardar(telegramId, "OBS_EDIT_TIPIFICACION", codigoObra, { idObservacion: id, tipificaciones: tips });
      return TelegramService.enviarMensaje(chatId, "Seleccioná la nueva tipificación:", TelegramService.teclado([...tips.map(x => [x.descripcion]), ["Volver al detalle"]]));
    }

    if (opcion === "UBICACION") {
      BLL_SesionTelegram.guardar(telegramId, "OBS_EDIT_UBICACION", codigoObra, { idObservacion: id });
      return TelegramService.enviarMensaje(
        chatId,
        "Compartí la nueva ubicación o ingresá una referencia manual.",
        TelegramService.teclado([[{ text: "Compartir ubicación", request_location: true }], ["Ingresar referencia"], ["Volver al detalle"]])
      );
    }

    if (opcion === "COMENTARIO") {
      BLL_SesionTelegram.guardar(telegramId, "OBS_EDIT_COMENTARIO", codigoObra, { idObservacion: id });
      return TelegramService.enviarMensaje(chatId, "Ingresá el nuevo comentario:", TelegramService.teclado([["Quitar comentario"], ["Volver al detalle"]]));
    }

    if (opcion === "FOTOS") {
      BLL_SesionTelegram.guardar(telegramId, "OBS_EDIT_FOTO", codigoObra, { idObservacion: id, fotosNuevas: [] });
      return TelegramService.enviarMensaje(chatId, "Enviá la foto que querés agregar a esta observación.", TelegramService.teclado([["Volver al detalle"]]));
    }

    return this._mostrarMenuEdicion(chatId, telegramId, codigoObra, id);
  }

  static _editarTipificacion(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();
    if (opcion === "VOLVER AL DETALLE") return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion);

    const tips = Array.isArray(contexto.tipificaciones) ? contexto.tipificaciones : [];
    const seleccionada = tips.find(x => this._normalizar(x.descripcion) === opcion);
    if (!seleccionada) return TelegramService.enviarMensaje(chatId, "Seleccioná una de las tipificaciones disponibles.", TelegramService.teclado([...tips.map(x => [x.descripcion]), ["Volver al detalle"]]));

    if (this._normalizar(seleccionada.descripcion) === "OTROS") {
      BLL_SesionTelegram.guardar(telegramId, "OBS_EDIT_OTROS_COMENTARIO", codigoObra, { idObservacion: contexto.idObservacion, idTipificacion: seleccionada.id });
      return TelegramService.enviarMensaje(chatId, "Seleccionaste <b>OTROS</b>. Ingresá el comentario que describe esta observación:", TelegramService.teclado([["Volver al detalle"]]));
    }

    try {
      BLL_Observacion.editar(contexto.idObservacion, { IdTipificacion: seleccionada.id }, usuario.CodUsuario);
      return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, "Tipificación actualizada.");
    } catch (error) {
      return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, this._mensajeError(error));
    }
  }

  static _editarOtrosComentario(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();
    if (opcion === "VOLVER AL DETALLE") return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion);

    const comentario = String(texto || "").trim();
    if (comentario.length < 2) return TelegramService.enviarMensaje(chatId, "Ingresá un comentario válido.", TelegramService.teclado([["Volver al detalle"]]));

    try {
      BLL_Observacion.editar(contexto.idObservacion, { IdTipificacion: contexto.idTipificacion, Comentario: comentario }, usuario.CodUsuario);
      return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, "Tipificación y comentario actualizados.");
    } catch (error) {
      return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, this._mensajeError(error));
    }
  }

  static _editarUbicacion(chatId, telegramId, texto, usuario, sesion, mensaje) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();
    const opcion = this._normalizar(texto);
    if (opcion === "VOLVER AL DETALLE") return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion);

    if (mensaje && mensaje.location) {
      try {
        BLL_Observacion.editar(contexto.idObservacion, { Latitud: mensaje.location.latitude, Longitud: mensaje.location.longitude, ReferenciaUbicacion: "" }, usuario.CodUsuario);
        return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, "Ubicación actualizada.");
      } catch (error) {
        return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, this._mensajeError(error));
      }
    }

    if (opcion === "INGRESAR REFERENCIA") {
      BLL_SesionTelegram.guardar(telegramId, "OBS_EDIT_REFERENCIA", codigoObra, { idObservacion: contexto.idObservacion });
      return TelegramService.enviarMensaje(chatId, "Ingresá calle, altura o una referencia clara:", TelegramService.teclado([["Volver al detalle"]]));
    }

    return TelegramService.enviarMensaje(chatId, "Usá <b>Compartir ubicación</b> o <b>Ingresar referencia</b>.", TelegramService.teclado([[{ text: "Compartir ubicación", request_location: true }], ["Ingresar referencia"], ["Volver al detalle"]]));
  }

  static _editarReferencia(chatId, telegramId, texto, usuario, sesion) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();
    if (this._normalizar(texto) === "VOLVER AL DETALLE") return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion);
    const referencia = String(texto || "").trim();
    if (referencia.length < 3) return TelegramService.enviarMensaje(chatId, "Ingresá una referencia válida.", TelegramService.teclado([["Volver al detalle"]]));

    try {
      BLL_Observacion.editar(contexto.idObservacion, { Latitud: null, Longitud: null, ReferenciaUbicacion: referencia }, usuario.CodUsuario);
      return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, "Ubicación actualizada.");
    } catch (error) {
      return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, this._mensajeError(error));
    }
  }

  static _editarComentario(chatId, telegramId, texto, usuario, sesion) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();
    const opcion = this._normalizar(texto);
    if (opcion === "VOLVER AL DETALLE") return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion);

    const comentario = opcion === "QUITAR COMENTARIO" ? "" : String(texto || "").trim();
    if (opcion !== "QUITAR COMENTARIO" && comentario.length < 2) return TelegramService.enviarMensaje(chatId, "Ingresá un comentario válido.", TelegramService.teclado([["Quitar comentario"], ["Volver al detalle"]]));

    try {
      BLL_Observacion.editar(contexto.idObservacion, { Comentario: comentario }, usuario.CodUsuario);
      return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, comentario ? "Comentario actualizado." : "Comentario eliminado.");
    } catch (error) {
      return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, this._mensajeError(error));
    }
  }

  static _recibirFotoEdicion(chatId, telegramId, texto, usuario, sesion, mensaje) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();
    if (this._normalizar(texto) === "VOLVER AL DETALLE") return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion);

    const fotos = mensaje && Array.isArray(mensaje.photo) ? mensaje.photo : [];
    if (!fotos.length) {
      return TelegramService.enviarMensaje(chatId, "Enviá una foto para agregarla a la observación.", TelegramService.teclado([["Volver al detalle"]]));
    }

    const foto = fotos[fotos.length - 1];
    contexto.fotosNuevas = Array.isArray(contexto.fotosNuevas) ? contexto.fotosNuevas : [];
    contexto.fotosNuevas.push(foto.file_id);
    BLL_SesionTelegram.guardar(telegramId, "OBS_EDIT_FOTO_ACCION", codigoObra, contexto);

    return TelegramService.enviarMensaje(
      chatId,
      `Foto recibida. Fotos nuevas: <b>${contexto.fotosNuevas.length}</b>.`,
      TelegramService.teclado([["Agregar otra foto"], ["Guardar fotos"], ["Volver al detalle"]])
    );
  }

  static _procesarAccionFotoEdicion(chatId, telegramId, texto, usuario, sesion) {
    const opcion = this._normalizar(texto);
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();

    if (opcion === "VOLVER AL DETALLE") return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion);

    if (opcion === "AGREGAR OTRA FOTO") {
      BLL_SesionTelegram.guardar(telegramId, "OBS_EDIT_FOTO", codigoObra, contexto);
      return TelegramService.enviarMensaje(chatId, "Enviá la siguiente foto.", TelegramService.teclado([["Volver al detalle"]]));
    }

    if (opcion === "GUARDAR FOTOS") {
      try {
        const cantidad = BLL_Observacion.agregarEvidencias(contexto.idObservacion, contexto.fotosNuevas || [], usuario.CodUsuario);
        return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, `${cantidad} foto${cantidad === 1 ? "" : "s"} agregada${cantidad === 1 ? "" : "s"}.`);
      } catch (error) {
        return TelegramService.enviarMensaje(chatId, this._mensajeError(error), TelegramService.teclado([["Agregar otra foto"], ["Guardar fotos"], ["Volver al detalle"]]));
      }
    }

    return TelegramService.enviarMensaje(chatId, "Seleccioná <b>Agregar otra foto</b>, <b>Guardar fotos</b> o <b>Volver al detalle</b>.", TelegramService.teclado([["Agregar otra foto"], ["Guardar fotos"], ["Volver al detalle"]]));
  }

  static _confirmarEliminarObservacion(chatId, telegramId, texto, usuario, sesion) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigoObra = String(sesion.CodigoObraActiva || "").trim().toUpperCase();
    const opcion = this._normalizar(texto);
    if (opcion === "CANCELAR" || opcion === "VOLVER AL DETALLE") return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion);
    if (opcion !== "CONFIRMAR ELIMINACION") return TelegramService.enviarMensaje(chatId, "Seleccioná <b>Confirmar eliminación</b> o <b>Cancelar</b>.", TelegramService.teclado([["Confirmar eliminación"], ["Cancelar"]]));

    try {
      BLL_Observacion.eliminar(contexto.idObservacion, usuario.CodUsuario);
      return this._mostrarObservaciones(chatId, telegramId, usuario, codigoObra, "Observación eliminada correctamente.");
    } catch (error) {
      return this._mostrarDetalleObservacion(chatId, telegramId, usuario, codigoObra, contexto.idObservacion, this._mensajeError(error));
    }
  }

  static _mostrarSupervisionesEnCurso(chatId, telegramId, usuario) {
    const supervisiones = BLL_Supervision.listarEnCurso();
    if (!supervisiones.length) return this._mostrarMenuPrincipalCompacto(chatId, usuario, "No hay supervisiones en curso.");

    const codigos = supervisiones.map(x => x.CodigoObra);
    BLL_SesionTelegram.guardar(telegramId, "SUP_SELECCIONAR_EN_CURSO", "", { coincidencias: codigos });
    return TelegramService.enviarMensaje(chatId, "<b>Supervisiones en curso</b>\n\nSeleccioná una obra para dejarla activa:", TelegramService.teclado([...codigos.map(x => [x]), ["Volver al menú"]]));
  }

  static _seleccionarEnCurso(chatId, telegramId, texto, usuario) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigo = String(texto || "").trim().toUpperCase();
    const coincidencias = Array.isArray(contexto.coincidencias) ? contexto.coincidencias : [];

    if (!coincidencias.includes(codigo)) return TelegramService.enviarMensaje(chatId, "Seleccioná una de las supervisiones en curso.", TelegramService.teclado([...coincidencias.map(x => [x]), ["Volver al menú"]]));

    const supervision = BLL_Supervision.obtener(codigo);
    if (!supervision || supervision.Estado !== Config.ESTADOS_SUPERVISION.EN_CURSO) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipalCompacto(chatId, usuario, "La supervisión seleccionada ya no está en curso.");
    }

    BLL_SesionTelegram.guardar(telegramId, "SUP_OBRA_ACTIVA", codigo, {});
    return this._mostrarObraActiva(chatId, supervision);
  }

  static _mostrarSupervisionesFinalizadas(chatId, telegramId, usuario) {
    const supervisiones = BLL_Supervision.listarFinalizadas();
    if (!supervisiones.length) return this._mostrarMenuPrincipalCompacto(chatId, usuario, "No hay supervisiones finalizadas.");

    const codigos = supervisiones.map(x => x.CodigoObra);
    BLL_SesionTelegram.guardar(telegramId, "SUP_SELECCIONAR_FINALIZADA", "", { coincidencias: codigos });
    return TelegramService.enviarMensaje(chatId, "<b>Supervisiones finalizadas</b>\n\nSeleccioná una obra para consultar:", TelegramService.teclado([...codigos.map(x => [x]), ["Volver al menú"]]));
  }

  static _seleccionarFinalizada(chatId, telegramId, texto, usuario) {
    const contexto = BLL_SesionTelegram.contexto(telegramId);
    const codigo = String(texto || "").trim().toUpperCase();
    const coincidencias = Array.isArray(contexto.coincidencias) ? contexto.coincidencias : [];

    if (!coincidencias.includes(codigo)) return TelegramService.enviarMensaje(chatId, "Seleccioná una de las supervisiones finalizadas.", TelegramService.teclado([...coincidencias.map(x => [x]), ["Volver al menú"]]));

    const supervision = BLL_Supervision.obtener(codigo);
    if (!supervision || supervision.Estado !== Config.ESTADOS_SUPERVISION.FINALIZADA) {
      BLL_SesionTelegram.limpiar(telegramId);
      return this._mostrarMenuPrincipalCompacto(chatId, usuario, "La supervisión seleccionada no está finalizada.");
    }

    return TelegramService.enviarMensaje(chatId, `<b>Supervisión finalizada</b>\nObra: <b>${this._esc(supervision.CodigoObra)}</b>\nInicio: ${this._fecha(supervision.FechaInicio)}\nFinalización: ${this._fecha(supervision.FechaFinalizacion)}`, TelegramService.teclado([["Volver al menú"]]));
  }

  static _mostrarMenuPrincipal(chatId, usuario, prefijo = "") {
    const saludo = `Hola <b>${this._esc(usuario.Nombre)}</b>.\nRol: <b>${this._esc(usuario.RolAprobado)}</b>.`;
    const mensaje = `${prefijo ? `${prefijo}\n\n` : ""}${saludo}\n\n¿Qué querés hacer?`;
    return TelegramService.enviarMensaje(chatId, mensaje, this._tecladoMenuPrincipal());
  }

  static _mostrarMenuPrincipalCompacto(chatId, usuario, mensajeEstado) {
    return TelegramService.enviarMensaje(
      chatId,
      `<b>${this._esc(usuario.Nombre)}</b>.\n${mensajeEstado}\n\n¿Qué querés hacer?`,
      this._tecladoMenuPrincipal()
    );
  }

  static _mostrarObraActiva(chatId, supervision, prefijo = "") {
    const mensaje = `${prefijo ? `${prefijo}\n\n` : ""}<b>Obra activa</b>\nObra: <b>${this._esc(supervision.CodigoObra)}</b>\nEstado: <b>${this._mostrarValor(supervision.Estado)}</b>\nInicio: ${this._fecha(supervision.FechaInicio)}`;
    return TelegramService.enviarMensaje(chatId, mensaje, this._tecladoObraActiva());
  }

  static _tecladoMenuPrincipal() {
    return TelegramService.teclado([["Iniciar nueva supervisión"], ["Supervisiones en curso"], ["Supervisiones finalizadas"]]);
  }

  static _tecladoObraActiva() {
    return TelegramService.teclado([["Reportar observación"], ["Ver observaciones"], ["Finalizar supervisión"], ["Volver al menú"]]);
  }

  static _esVolverMenu(texto) { return this._normalizar(texto) === "VOLVER AL MENU"; }
  static _esCancelarObservacion(texto) { return this._normalizar(texto) === "CANCELAR OBSERVACION"; }

  static _normalizar(texto) {
    return String(texto || "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }

  static _fecha(fecha) {
    return fecha ? Utilities.formatDate(new Date(fecha), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm") : "-";
  }

  static _fechaCorta(fecha) {
    return fecha ? Utilities.formatDate(new Date(fecha), Session.getScriptTimeZone(), "dd/MM HH:mm") : "-";
  }

  static _mostrarValor(valor) { return this._esc(String(valor || "").replace(/_/g, " ")); }

  static _esc(valor) {
    return String(valor == null ? "" : valor).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  static _ubicacionObservacion(observacion) {
    const lat = observacion ? observacion.Latitud : null;
    const lon = observacion ? observacion.Longitud : null;
    const tieneLat = lat !== null && lat !== undefined && String(lat).trim() !== "";
    const tieneLon = lon !== null && lon !== undefined && String(lon).trim() !== "";
    if (tieneLat && tieneLon) return `${this._esc(lat)}, ${this._esc(lon)}`;
    return this._esc(observacion && observacion.ReferenciaUbicacion ? observacion.ReferenciaUbicacion : "-");
  }

  static _nombreUsuario(codUsuario) {
    const u = BLL_Usuario.obtenerUsuarioPorCodUsuario(codUsuario);
    if (!u) return "Usuario";
    return `${String(u.Nombre || "").trim()} ${String(u.Apellido || "").trim()}`.trim() || "Usuario";
  }

  static _mensajeError(error) {
    return error && error.message ? this._esc(error.message) : "No se pudo completar la operación.";
  }
}
