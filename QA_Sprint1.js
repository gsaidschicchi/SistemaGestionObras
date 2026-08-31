// ======================================================
// QA_SPRINT1.JS
// Ejecuta en conjunto los test automáticos de CU00 y CU01.
// ======================================================
function QA_Sprint1(){const a=QA_CU00(),b=QA_CU01();const total=a.total+b.total,ok=a.ok+b.ok;const r={grupo:"SPRINT1",total,ok,fallas:total-ok,detalle:[...a.detalle,...b.detalle]};return QA_imprimir(r);}
