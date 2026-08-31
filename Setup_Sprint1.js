// ======================================================
// SETUP_SPRINT1.JS
// Crea o verifica las hojas físicas requeridas por Sprint 1.
// ======================================================
function setupSprint1(){ Object.keys(Config.HOJAS).forEach(k=>{const n=Config.HOJAS[k]; DataSourceSheets.asegurarHoja(n,Config.HEADERS[k]);}); Logger.log("Sprint 1: estructura de hojas verificada."); }
