// ======================================================
// QA_ASSERT.JS
// Aserciones utilizadas por los tests automáticos.
// ======================================================
class QA_Assert {
  static ok(c,m="Se esperaba true"){if(!c)throw new Error(m);} static igual(a,b,m="Valores distintos"){if(a!==b)throw new Error(`${m}. Esperado=${b} Obtenido=${a}`);} static error(fn,codigo){let e=null;try{fn();}catch(x){e=x;}if(!e)throw new Error(`Se esperaba error ${codigo}`);if(codigo&&e.codigo!==codigo)throw new Error(`Error esperado=${codigo}; obtenido=${e.codigo||e.message}`);}
}
