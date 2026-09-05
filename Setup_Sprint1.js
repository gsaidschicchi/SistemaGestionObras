// ======================================================
// SETUP_SPRINT1.JS
// Crea/verifica hojas y protege identificadores como texto.
// ======================================================
function setupSprint1() {
  const ss = DataSourceSheets.obtenerSpreadsheet();

  // Migración cierre Sprint 1: amplía CONTRATISTAS sin perder ID/NOMBRE/ACTIVO existentes.
  const hc = ss.getSheetByName(Config.HOJAS.CONTRATISTAS);
  if (hc && hc.getLastRow() > 0 && hc.getLastColumn() === 3 && hc.getRange(1, 2).getValue() === "NOMBRE") {
    hc.insertColumnBefore(2);
    hc.getRange(1, 1, 1, 4).setValues([["ID_CONTRATISTA","LOCALIZADOR_DESTINO","NOMBRE_CONTRATISTA","ACTIVO"]]);
  }

  // Migración v0.5.6: agrega COMENTARIO_GENERAL a REPORTES sin perder datos existentes.
  const hr = ss.getSheetByName(Config.HOJAS.REPORTES);
  if (hr && hr.getLastRow() > 0 && hr.getLastColumn() === 8 && hr.getRange(1, 6).getValue() === "NOMBRE_ARCHIVO") {
    hr.insertColumnBefore(6);
    hr.getRange(1, 6).setValue("COMENTARIO_GENERAL");
  }

  Object.keys(Config.HOJAS).forEach(k => {
    const nombre = Config.HOJAS[k];
    DataSourceSheets.asegurarHoja(nombre, Config.HEADERS[k]);
  });

  const hRoles = DataSourceSheets.obtenerHoja(Config.HOJAS.ROLES);
  if (hRoles.getLastRow() < 2) {
    hRoles.getRange(2, 1, 8, 4).setValues([
      [Config.ROLES.SUPERVISOR, "Supervisor", Config.ACTIVO.SI, "SUP"],
      [Config.ROLES.GERENTE, "Gerente", Config.ACTIVO.SI, "GER"],
      [Config.ROLES.DIRECTOR, "Director", Config.ACTIVO.SI, "DIR"],
      [Config.ROLES.ADMINISTRADOR, "Administrador", Config.ACTIVO.NO, "ADM"],
      [Config.ROLES.ADMINISTRATIVO_CONTRATISTA, "Administrativo Contratista", Config.ACTIVO.SI, "ADC"],
      [Config.ROLES.ANALISTA_DESPACHO, "Analista Despacho", Config.ACTIVO.SI, "ADE"],
      [Config.ROLES.SUPERVISORES_OBRA_TLC, "Supervisor Obra TLC", Config.ACTIVO.SI, "SOT"],
      [Config.ROLES.JEFE_OBRA_, "Jefe de Obra", Config.ACTIVO.SI, "JOB"]
    ]);
  }

  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.USUARIOS, 1);
  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.USUARIOS, 6);
  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.SESIONES_TELEGRAM, 1);
  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.CONTRATISTAS, 1);
  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.CONTRATISTAS, 2);
  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.OBRAS, 1);
  DataSourceSheets.formatearColumnaTexto(Config.HOJAS.TIPIFICACIONES, 1);
  DataSourceSheets.formatearColumnaFechaHora(Config.HOJAS.SUPERVISIONES, 2);
  DataSourceSheets.formatearColumnaFechaHora(Config.HOJAS.SUPERVISIONES, 3);
  DataSourceSheets.formatearColumnaFechaHora(Config.HOJAS.OBSERVACIONES, 5);
  DataSourceSheets.formatearColumnaFechaHora(Config.HOJAS.OBSERVACIONES, 11);
  DataSourceSheets.formatearColumnaFechaHora(Config.HOJAS.OBSERVACIONES, 13);
  DataSourceSheets.formatearColumnaFechaHora(Config.HOJAS.EVIDENCIAS, 6);
  DataSourceSheets.formatearColumnaFechaHora(Config.HOJAS.REPORTES, 4);
  DataSourceSheets.formatearColumnaFechaHora(Config.HOJAS.SESIONES_TELEGRAM, 5);

  Logger.log("Sprint 1: estructura verificada e identificadores configurados como texto.");
}
