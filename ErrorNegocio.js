// ======================================================
// ERRORNEGOCIO.JS
// Error de negocio con código estable para GUI y QA.
// ======================================================
class ErrorNegocio extends Error {
  constructor(codigo, mensaje) { super(mensaje); this.name="ErrorNegocio"; this.codigo=codigo; }
}
