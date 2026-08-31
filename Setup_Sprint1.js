// ======================================================
// SETUP_SPRINT1.JS
// Crea/verifica hojas y protege identificadores como texto.
// ======================================================
function setupSprint1() {
  Object.keys(Config.HOJAS).forEach(k => {
    const nombre = Config.HOJAS[k];
    DataSourceSheets.asegurarHoja(nombre, Config.HEADERS[k]);
  });

  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.USUARIOS, 1);
  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.USUARIOS, 6);
  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.SESIONES_TELEGRAM, 1);
  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.OBRAS, 1);
  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.TIPIFICACIONES, 1);

  Logger.log("Sprint 1: estructura verificada e identificadores configurados como texto.");
}
