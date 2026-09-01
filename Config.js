  // ======================================================
  // CONFIG.JS
  // Constantes, estados, nombres de hojas y parámetros.
  // ======================================================

  const Config = Object.freeze({

    HOJAS: {
      USUARIOS: "USUARIOS",
      CONTRATISTAS: "CONTRATISTAS",
      OBRAS: "OBRAS",
      SUPERVISIONES: "SUPERVISIONES",
      OBSERVACIONES: "OBSERVACIONES",
      TIPIFICACIONES: "TIPIFICACIONES",
      EVIDENCIAS: "EVIDENCIAS",
      REPORTES: "REPORTES",
      SESIONES_TELEGRAM: "SESIONES_TELEGRAM"
    },

    ROLES: {
      SUPERVISOR: "SUPERVISOR",
      GERENTE: "GERENTE",
      DIRECTOR: "DIRECTOR",
      ADMINISTRADOR: "ADMINISTRADOR"
    },

    ESTADOS_APROBACION: {
      PENDIENTE: "PENDIENTE_APROBACION",
      APROBADO: "APROBADO",
      RECHAZADO: "RECHAZADA",
      PENDIENTE_REACTIVACION: "PENDIENTE_REACTIVACION"
    },

    ACTIVO: {
      SI: "SI",
      NO: "NO"
    },

    ESTADOS_SUPERVISION: {
      EN_CURSO: "EN_CURSO",
      FINALIZADA: "FINALIZADA"
    },

    ESTADOS_REGISTRO: {
      ACTIVA: "ACTIVA",
      ELIMINADA: "ELIMINADA"
    },

    ESTADOS_REPORTE: {
      VIGENTE: "VIGENTE",
      REEMPLAZADO: "REEMPLAZADO"
    },

    FAMILIAS_OBRA: {
      OC: "OBRA_CIVIL",
      FO: "FIBRA_OPTICA",
      FTTH: "ACCESO_FTTH"
    },

    DIAS_INACTIVIDAD: 30,

    COD_ADMIN_SISTEMA: "ADM001",

    // ======================================================
    // BIGQUERY
    // Configuración de fuentes PM.
    // ======================================================

    BIGQUERY: {
      PROJECT_ID: "bot-estado-obras",
      DATASET_PM: "pm_obras",

      TABLA_OBRAS_PM: "pm_obras_validas",
      TABLA_MOVIMIENTOS_PM: "pm_movimientos_raw",
      TABLA_OBRAS_CATALOGO: "pm_obras_catalogo",

      LOCATION: "US",
      LIMITE_BUSQUEDA_OBRAS: 50
    },

    PM: {
      NOMBRE_CARPETA: "PM_Obras",
      NOMBRE_ARCHIVO: "APPS_PMOVXF.txt"
    },

    HEADERS: {

      USUARIOS: [
        "TELEGRAM_ID",
        "NOMBRE",
        "APELLIDO",
        "ROL_SOLICITADO",
        "ROL_APROBADO",
        "COD_USUARIO",
        "ESTADO_APROBACION",
        "ACTIVO",
        "FECHA_ALTA",
        "FECHA_APROBACION",
        "APROBADO_POR",
        "ULTIMO_ACCESO"
      ],

      CONTRATISTAS: [
        "ID_CONTRATISTA",
        "LOCALIZADOR_DESTINO",
        "NOMBRE_CONTRATISTA",
        "ACTIVO"
      ],

      OBRAS: [
        "CODIGO_OBRA",
        "ID_CONTRATISTA",
        "FAMILIA",
        "ACTIVA"
      ],

      SUPERVISIONES: [
        "CODIGO_OBRA",
        "FECHA_INICIO",
        "FECHA_FINALIZACION",
        "ESTADO",
        "COD_USUARIO_INICIO",
        "COD_USUARIO_FINALIZACION"
      ],

      OBSERVACIONES: [
        "ID_OBSERVACION",
        "CODIGO_OBRA",
        "COD_USUARIO",
        "ID_TIPIFICACION",
        "FECHA_HORA",
        "LATITUD",
        "LONGITUD",
        "REFERENCIA_UBICACION",
        "COMENTARIO",
        "ESTADO",
        "FECHA_ULT_MODIFICACION",
        "COD_USUARIO_ULT_MODIFICACION",
        "FECHA_ELIMINACION",
        "COD_USUARIO_ELIMINACION"
      ],

      TIPIFICACIONES: [
        "ID_TIPIFICACION",
        "FAMILIA_OBRA",
        "CATEGORIA",
        "DESCRIPCION",
        "SEVERIDAD",
        "ESTADO_TIPIFICACION",
        "PROPUESTA_POR",
        "FECHA_PROPUESTA",
        "VALIDADA_POR",
        "FECHA_VALIDACION"
      ],

      EVIDENCIAS: [
        "ID_EVIDENCIA",
        "ID_OBSERVACION",
        "TIPO",
        "NOMBRE_ARCHIVO",
        "DRIVE_FILE_ID",
        "FECHA_HORA",
        "ESTADO"
      ],

      REPORTES: [
        "ID_REPORTE",
        "CODIGO_OBRA",
        "VERSION",
        "FECHA_GENERACION",
        "COD_USUARIO_GENERADOR",
        "COMENTARIO_GENERAL",
        "NOMBRE_ARCHIVO",
        "DRIVE_FILE_ID",
        "ESTADO"
      ],

      SESIONES_TELEGRAM: [
        "TELEGRAM_ID",
        "ESTADO_CONVERSACION",
        "CODIGO_OBRA_ACTIVA",
        "CONTEXTO_FLUJO",
        "ULTIMA_INTERACCION"
      ]
    }

  });