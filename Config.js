// ======================================================
// CONFIG.GS
// Centraliza constantes y parámetros generales del sistema.
// No contiene reglas de negocio.
// ======================================================

const Config = Object.freeze({

  // Nombres físicos de las hojas de Google Sheets
  HOJAS: {
    USUARIOS: "USUARIOS"
  },

  // Roles disponibles en el sistema
  ROLES: {
    SUPERVISOR: "SUPERVISOR",
    GERENTE: "GERENTE",
    DIRECTOR: "DIRECTOR",
    ADMINISTRADOR: "ADMINISTRADOR"
  },

  // Estados posibles del proceso de aprobación
  ESTADOS_APROBACION: {
    PENDIENTE: "PENDIENTE_APROBACION",
    APROBADO: "APROBADO",
    RECHAZADO: "RECHAZADA",
    PENDIENTE_REACTIVACION: "PENDIENTE_REACTIVACION"
  },

  // Estado de actividad del usuario
  ACTIVO: {
    SI: "SI",
    NO: "NO"
  },

  // Parámetros configurables
  DIAS_INACTIVIDAD: 30

});