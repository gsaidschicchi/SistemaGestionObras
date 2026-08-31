// ======================================================
// TRIGGER_USUARIO.JS
// Detecta la aprobación manual en la hoja USUARIOS.
// La lógica de negocio permanece en BLL_Usuario.
// ======================================================
function onEdit(e) {
  if (!e || !e.range) return;

  const hoja = e.range.getSheet();
  if (hoja.getName() !== Config.HOJAS.USUARIOS) return;
  if (e.range.getRow() <= 1) return;

  const columnaEstado = Config.HEADERS.USUARIOS.indexOf("ESTADO_APROBACION") + 1;
  if (e.range.getColumn() !== columnaEstado || e.range.getNumRows() !== 1 || e.range.getNumColumns() !== 1) return;

  const estadoAnterior = String(e.oldValue || "").trim();
  const estadoNuevo = String(e.value || "").trim();

  if (
    estadoAnterior !== Config.ESTADOS_APROBACION.PENDIENTE ||
    estadoNuevo !== Config.ESTADOS_APROBACION.APROBADO
  ) return;

  const telegramId = hoja.getRange(e.range.getRow(), 1).getDisplayValue().trim();
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    BLL_Usuario.aprobarDesdeEdicionManual(
      telegramId,
      estadoAnterior,
      Config.COD_ADMIN_SISTEMA
    );
  } catch (error) {
    e.range.setValue(estadoAnterior);
    console.error(`[CU00] Error en aprobación manual de ${telegramId}: ${error && error.stack ? error.stack : error}`);
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}
