// ======================================================
// QA_RUNNER.JS
// Ejecutor visible y acumulador de resultados QA.
// ======================================================
class QA_Runner {
  constructor(grupo){this.grupo=grupo;this.resultados=[];}

  caso(id,nombre,esperado,fn){
    if(typeof esperado === "function"){fn=esperado;esperado="Cumplir todas las aserciones definidas.";}
    esperado=esperado||"Cumplir todas las aserciones definidas.";

    Logger.log("==================================================");
    Logger.log(`TEST: ${id}`);
    Logger.log(`DESCRIPCIÓN: ${nombre}`);
    Logger.log(`RESULTADO ESPERADO: ${esperado}`);

    try{
      const obtenido=fn();
      const txt=obtenido===undefined?"Aserciones satisfechas.":this._texto(obtenido);
      Logger.log(`RESULTADO OBTENIDO: ${txt}`);
      Logger.log("ESTADO: PASS");
      this.resultados.push({id,nombre,esperado,obtenido:txt,ok:true,estado:"PASS",error:""});
    }catch(e){
      const error=e&&e.codigo?`${e.codigo}: ${e.message}`:(e&&e.message?e.message:String(e));
      Logger.log(`RESULTADO OBTENIDO: ${error}`);
      Logger.log("ESTADO: NO PASS");
      this.resultados.push({id,nombre,esperado,obtenido:error,ok:false,estado:"NO PASS",error});
    }
    Logger.log("==================================================");
  }

  resumen(){const ok=this.resultados.filter(x=>x.ok).length;return {grupo:this.grupo,total:this.resultados.length,ok,fallas:this.resultados.length-ok,detalle:this.resultados};}
  _texto(v){try{return typeof v==="string"?v:JSON.stringify(v);}catch(e){return String(v);}}
}
