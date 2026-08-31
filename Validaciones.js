// ======================================================
// VALIDACIONES.JS
// Helper común para validaciones de reglas de negocio.
// ======================================================
function exigir(condicion, codigo, mensaje) { if (!condicion) throw new ErrorNegocio(codigo, mensaje); }
