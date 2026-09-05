// ======================================================
// QA_ROLES.JS
// QA previo/posterior del catálogo dinámico de roles CU00.
// ======================================================
function QA_Roles(){
  const q=new QA_Runner("SPRINT2A - ROLES DINÁMICOS");
  const t0=new Date("2026-09-05T12:00:00Z");
  const roles=new QA_RolRepo();

  q.caso("QA-R01","CU00 acepta un rol activo","La solicitud queda PENDIENTE_APROBACION.",()=>{
    const r=new QA_Repo();
    const u=BLL_Usuario.solicitarAlta("R1","Ana","Paz",Config.ROLES.ADMINISTRATIVO_CONTRATISTA,r,t0,roles);
    QA_Assert.igual(u.EstadoAprobacion,Config.ESTADOS_APROBACION.PENDIENTE);
    return u.EstadoAprobacion;
  });

  q.caso("QA-R02","CU00 rechaza un rol no activo","Debe lanzar ROL_NO_PERMITIDO.",()=>{
    const r=new QA_Repo();
    QA_Assert.error(()=>BLL_Usuario.solicitarAlta("R2","Ana","Paz",Config.ROLES.ADMINISTRADOR,r,t0,roles),"ROL_NO_PERMITIDO");
    return "ROL_NO_PERMITIDO confirmado";
  });

  q.caso("QA-R03","Un rol agregado al catálogo aparece sin cambiar BLL","El nuevo rol activo es recuperado por obtenerRolesPublicos().",()=>{
    const x=new QA_RolRepo(roles.listar().concat([{Rol:"ROL_TEST_NUEVO",Descripcion:"Rol Test Nuevo",Activo:Config.ACTIVO.SI,PrefijoCod:"RTN"}]));
    const encontrado=BLL_Usuario.obtenerRolesPublicos(x).some(r=>r.Rol==="ROL_TEST_NUEVO");
    QA_Assert.ok(encontrado,"El rol agregado no fue recuperado");
    return `ROL_TEST_NUEVO encontrado=${encontrado}`;
  });

  q.caso("QA-R04","Un rol eliminado deja de aparecer","El rol removido no se devuelve como solicitable.",()=>{
    const x=new QA_RolRepo(roles.listar().filter(r=>r.Rol!==Config.ROLES.DIRECTOR));
    const encontrado=BLL_Usuario.obtenerRolesPublicos(x).some(r=>r.Rol===Config.ROLES.DIRECTOR);
    QA_Assert.igual(encontrado,false);
    return `DIRECTOR encontrado=${encontrado}`;
  });

  q.caso("QA-R05","DAL_Rol resuelve columnas por encabezado","TEST_ROLES se lee correctamente aunque cambie el orden físico de columnas.",()=>{
    const ss=DataSourceSheets.obtenerSpreadsheet();
    const h=ss.getSheetByName("TEST_ROLES");
    h.clear();
    h.getRange(1,1,1,4).setValues([["PREFIJO_COD","ACTIVO","DESCRIPCION","ROL"]]);
    h.getRange(2,1,1,4).setValues([["ADC","SI","Administrativo Contratista",Config.ROLES.ADMINISTRATIVO_CONTRATISTA]]);
    const lista=DAL_Rol.listar("TEST_ROLES");
    QA_Assert.igual(lista.length,1); QA_Assert.igual(lista[0].Rol,Config.ROLES.ADMINISTRATIVO_CONTRATISTA); QA_Assert.igual(lista[0].PrefijoCod,"ADC");
    return lista[0];
  });

  q.caso("QA-R06","DAL_Rol ignora filas totalmente vacías","Una fila vacía intermedia no crea un rol.",()=>{
    const h=QA_Entorno.crearHoja("TEST_ROLES",Config.HEADERS.ROLES);
    h.getRange(2,1,3,4).setValues([[Config.ROLES.SUPERVISOR,"Supervisor","SI","SUP"],["","","",""],[Config.ROLES.GERENTE,"Gerente","SI","GER"]]);
    const lista=DAL_Rol.listar("TEST_ROLES");
    QA_Assert.igual(lista.length,2);
    return `Roles leídos=${lista.length}`;
  });


  q.caso("QA-R07","DAL_Rol ignora una fila inválida y continúa","La fila inválida no se devuelve y las filas válidas siguen disponibles.",()=>{
    const h=QA_Entorno.crearHoja("TEST_ROLES",Config.HEADERS.ROLES);
    h.getRange(2,1,3,4).setValues([[Config.ROLES.SUPERVISOR,"Supervisor","SI","SUP"],["ROL_MALO","","SI","XX"],[Config.ROLES.GERENTE,"Gerente","SI","GER"]]);
    const lista=DAL_Rol.listar("TEST_ROLES");
    QA_Assert.igual(lista.length,2);
    QA_Assert.igual(lista.some(x=>x.Rol==="ROL_MALO"),false);
    return `Roles válidos=${lista.length}; ROL_MALO ignorado`;
  });

  q.caso("QA-R08","CU00 expone los cuatro roles nuevos","Los cuatro roles nuevos están disponibles como solicitables.",()=>{
    const esperados=[Config.ROLES.ADMINISTRATIVO_CONTRATISTA,Config.ROLES.ANALISTA_DESPACHO,Config.ROLES.SUPERVISORES_OBRA_TLC,Config.ROLES.JEFE_OBRA_];
    const disponibles=BLL_Usuario.obtenerRolesPublicos(roles).map(r=>r.Rol);
    esperados.forEach(r=>QA_Assert.ok(disponibles.includes(r),`Falta rol ${r}`));
    return esperados;
  });

  q.caso("QA-R09","Prefijo de código se obtiene desde catálogo","ADMINISTRATIVO_CONTRATISTA genera ADC001.",()=>{
    const r=new QA_Repo();
    BLL_Usuario.solicitarAlta("R7","Ana","Paz",Config.ROLES.ADMINISTRATIVO_CONTRATISTA,r,t0,roles);
    const u=BLL_Usuario.aprobarUsuario("R7","ADM001",r,t0,roles);
    QA_Assert.igual(u.CodUsuario,"ADC001");
    return u.CodUsuario;
  });

  q.caso("QA-R10","Los prefijos nuevos son los aprobados","ADC / ADE / SOT / JOB.",()=>{
    const esperado={ADMINISTRATIVO_CONTRATISTA:"ADC",ANALISTA_DESPACHO:"ADE",SUPERVISORES_OBRA_TLC:"SOT",JEFE_OBRA_:"JOB"};
    Object.keys(esperado).forEach(k=>QA_Assert.igual(roles.buscarPorRol(Config.ROLES[k]).PrefijoCod,esperado[k]));
    return esperado;
  });

  return QA_imprimir(q.resumen());
}

function QA_Incremento_Roles(){
  let resultado=null;
  try{
    QA_Entorno.preparar();
    resultado=QA_Roles();
    const regresion=QA_Sprint1();
    const total=resultado.total+regresion.total,ok=resultado.ok+regresion.ok;
    return QA_imprimir({grupo:"INCREMENTO ROLES + REGRESIÓN SPRINT1",total,ok,fallas:total-ok,detalle:[...resultado.detalle,...regresion.detalle]});
  }finally{
    QA_Entorno.limpiar();
    QA_Entorno.verificarLimpieza();
  }
}
