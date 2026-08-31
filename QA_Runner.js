// ======================================================
// QA_RUNNER.JS
// Ejecutor y acumulador de resultados QA.
// ======================================================
class QA_Runner {
  constructor(grupo){this.grupo=grupo;this.resultados=[];} caso(id,nombre,fn){try{fn();this.resultados.push({id,nombre,ok:true,error:""});}catch(e){this.resultados.push({id,nombre,ok:false,error:e.codigo?`${e.codigo}: ${e.message}`:e.message});}} resumen(){const ok=this.resultados.filter(x=>x.ok).length;return {grupo:this.grupo,total:this.resultados.length,ok,fallas:this.resultados.length-ok,detalle:this.resultados};}
}
