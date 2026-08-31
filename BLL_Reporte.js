// ======================================================
// BLL_REPORTE.JS
// Reglas de versionado lógico de reportes.
// ======================================================
class BLL_Reporte {
  static prepararVersion(codigoObra,codUsuario,deps=null,ahora=new Date()){deps=deps||{supervisiones:DAL_Supervision,reportes:DAL_Reporte};const rs=deps.supervisiones.buscarPorObra(codigoObra);exigir(rs,"SUPERVISION_NO_EXISTE","No existe supervisión.");exigir(MAP_Supervision.FilaaBE(rs.datos).Estado===Config.ESTADOS_SUPERVISION.FINALIZADA,"SUPERVISION_EN_CURSO","Solo se reportan supervisiones finalizadas.");const prev=deps.reportes.listarPorObra(codigoObra);let max=0;prev.forEach(r=>{const x=MAP_Reporte.FilaaBE(r.datos);max=Math.max(max,Number(x.Version)||0);if(x.Estado===Config.ESTADOS_REPORTE.VIGENTE){x.Estado=Config.ESTADOS_REPORTE.REEMPLAZADO;deps.reportes.actualizar(r.fila,MAP_Reporte.BEaFila(x));}});const v=max+1;return {version:v,idReporte:`REP-${codigoObra}-${String(v).padStart(3,"0")}`,fecha:ahora,codUsuario};}
}
