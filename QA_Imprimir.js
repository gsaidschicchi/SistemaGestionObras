// ======================================================
// QA_IMPRIMIR.JS
// Presenta el resumen de ejecución de QA.
// ======================================================
function QA_imprimir(r){Logger.log(`${r.grupo}: ${r.ok}/${r.total} OK - Fallas: ${r.fallas}`);r.detalle.filter(x=>!x.ok).forEach(x=>Logger.log(`❌ ${x.id} ${x.nombre}: ${x.error}`));return r;}
