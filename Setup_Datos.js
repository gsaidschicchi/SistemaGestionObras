// ======================================================
// SETUP_DATOS.JS
// Ayudas iniciales para preparar datos maestros.
// ======================================================
function cargarTipificacionesEjemplo(){
  const h=DataSourceSheets.obtenerHoja(Config.HOJAS.TIPIFICACIONES); if(h.getLastRow()>1)return;
  const rows=[
    ["TIP001",Config.FAMILIAS_OBRA.OC,"GENERAL","OTROS","MEDIA","ACTIVA","",null,"",null],
    ["TIP002",Config.FAMILIAS_OBRA.FO,"GENERAL","OTROS","MEDIA","ACTIVA","",null,"",null],
    ["TIP003",Config.FAMILIAS_OBRA.FTTH,"GENERAL","OTROS","MEDIA","ACTIVA","",null,"",null]
  ]; h.getRange(2,1,rows.length,10).setValues(rows);
}
