// ======================================================
// QA_IMPRIMIR.JS
// Presenta resumen detallado de ejecución QA.
// ======================================================
function QA_imprimir(r){
  Logger.log("##################################################");
  Logger.log(`RESUMEN DE EJECUCIÓN: ${r.grupo}`);
  Logger.log(`Total tests: ${r.total}`);
  Logger.log(`PASS: ${r.ok}`);
  Logger.log(`NO PASS: ${r.fallas}`);
  Logger.log(`RESULTADO GENERAL: ${r.fallas===0?"PASS":"NO PASS"}`);
  Logger.log("##################################################");
  return r;
}
