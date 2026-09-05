// ======================================================
// QA_PERMISOS.JS
// Pruebas del Incremento 02: permisos dinámicos.
// ======================================================
class QA_PermisoRepoTest {
  static listarPorRol(rol){ return DAL_Permiso.listarPorRol(rol,"TEST_PERMISOS"); }
}

function QA_Permisos(){
  const q=new QA_Runner("SPRINT2A - PERMISOS DINÁMICOS");

  q.caso("QA-P01","Permiso explícito SI autoriza","GERENTE puede acceder a ESTADO_OBRA.",()=>{
    QA_Entorno.cargarPermisos([[Config.ROLES.GERENTE,Config.MODULOS.ESTADO_OBRA,"SI"]]);
    QA_Assert.ok(BLL_Usuario.tienePermiso(Config.ROLES.GERENTE,Config.MODULOS.ESTADO_OBRA,QA_PermisoRepoTest));
    return "Autorizado=true";
  });

  q.caso("QA-P02","Ausencia de permiso deniega","GERENTE no puede acceder a CONSULTA_PM si no existe fila.",()=>{
    QA_Entorno.cargarPermisos([[Config.ROLES.GERENTE,Config.MODULOS.ESTADO_OBRA,"SI"]]);
    QA_Assert.ok(!(BLL_Usuario.tienePermiso(Config.ROLES.GERENTE,Config.MODULOS.CONSULTA_PM,QA_PermisoRepoTest)));
    return "Autorizado=false";
  });

  q.caso("QA-P03","Permiso explícito NO deniega","Una fila PERMITIDO=NO no autoriza.",()=>{
    QA_Entorno.cargarPermisos([[Config.ROLES.GERENTE,Config.MODULOS.ESTADO_OBRA,"NO"]]);
    QA_Assert.ok(!(BLL_Usuario.tienePermiso(Config.ROLES.GERENTE,Config.MODULOS.ESTADO_OBRA,QA_PermisoRepoTest)));
    return "Autorizado=false";
  });

  q.caso("QA-P04","Wildcard de Administrador autoriza todos los módulos","ADMINISTRADOR con *=SI accede a SUPERVISION_OBRA, ESTADO_OBRA, CONSULTA_PM y DIFUSION_NUEVA.",()=>{
    QA_Entorno.cargarPermisos([[Config.ROLES.ADMINISTRADOR,"*","SI"]]);
    const mods=[Config.MODULOS.SUPERVISION_OBRA,Config.MODULOS.ESTADO_OBRA,Config.MODULOS.CONSULTA_PM,Config.MODULOS.DIFUSION_NUEVA];
    mods.forEach(m=>QA_Assert.ok(BLL_Usuario.tienePermiso(Config.ROLES.ADMINISTRADOR,m,QA_PermisoRepoTest)));
    return mods;
  });

  q.caso("QA-P05","Permiso específico prevalece sobre wildcard","*=SI y ESTADO_OBRA=NO debe denegar ESTADO_OBRA.",()=>{
    QA_Entorno.cargarPermisos([[Config.ROLES.ADMINISTRADOR,"*","SI"],[Config.ROLES.ADMINISTRADOR,Config.MODULOS.ESTADO_OBRA,"NO"]]);
    QA_Assert.ok(!(BLL_Usuario.tienePermiso(Config.ROLES.ADMINISTRADOR,Config.MODULOS.ESTADO_OBRA,QA_PermisoRepoTest)));
    QA_Assert.ok(BLL_Usuario.tienePermiso(Config.ROLES.ADMINISTRADOR,Config.MODULOS.CONSULTA_PM,QA_PermisoRepoTest));
    return "ESTADO_OBRA=false; CONSULTA_PM=true";
  });

  q.caso("QA-P06","Agregar permiso no requiere cambio en BLL","Una nueva fila habilita CONSULTA_PM inmediatamente.",()=>{
    QA_Entorno.cargarPermisos([[Config.ROLES.JEFE_OBRA_,Config.MODULOS.CONSULTA_PM,"SI"]]);
    QA_Assert.ok(BLL_Usuario.tienePermiso(Config.ROLES.JEFE_OBRA_,Config.MODULOS.CONSULTA_PM,QA_PermisoRepoTest));
    return "JEFE_OBRA_ / CONSULTA_PM=true";
  });

  q.caso("QA-P07","DAL_Permiso resuelve columnas por encabezado","TEST_PERMISOS funciona aunque cambie el orden físico de columnas.",()=>{
    const h=QA_Entorno.crearHoja("TEST_PERMISOS",["PERMITIDO","MODULO","ROL"]);
    h.getRange(2,1,1,3).setValues([["SI",Config.MODULOS.ESTADO_OBRA,Config.ROLES.GERENTE]]);
    const p=DAL_Permiso.listar("TEST_PERMISOS");
    QA_Assert.igual(p.length,1); QA_Assert.igual(p[0].Rol,Config.ROLES.GERENTE);
    return p[0];
  });

  q.caso("QA-P08","DAL_Permiso ignora filas vacías","Una fila vacía intermedia no crea permisos.",()=>{
    const h=QA_Entorno.crearHoja("TEST_PERMISOS",Config.HEADERS.PERMISOS);
    h.getRange(2,1,3,3).setValues([[Config.ROLES.GERENTE,Config.MODULOS.ESTADO_OBRA,"SI"],["","",""],[Config.ROLES.GERENTE,Config.MODULOS.CONSULTA_PM,"SI"]]);
    const p=DAL_Permiso.listar("TEST_PERMISOS"); QA_Assert.igual(p.length,2); return `Permisos leídos=${p.length}`;
  });

  q.caso("QA-P09","Fila inválida se ignora sin cortar la carga","Rol o módulo inválido se ignora y las filas válidas continúan.",()=>{
    const h=QA_Entorno.crearHoja("TEST_PERMISOS",Config.HEADERS.PERMISOS);
    h.getRange(2,1,3,3).setValues([[Config.ROLES.GERENTE,Config.MODULOS.ESTADO_OBRA,"SI"],["ROL_INVENTADO",Config.MODULOS.CONSULTA_PM,"SI"],[Config.ROLES.GERENTE,Config.MODULOS.CONSULTA_PM,"SI"]]);
    const p=DAL_Permiso.listar("TEST_PERMISOS"); QA_Assert.igual(p.length,2); return "Permisos válidos=2; fila inválida ignorada";
  });

  q.caso("QA-P10","Roles definidos para Estado de Obra y PM conservan acceso","Los cinco roles funcionales poseen ambos permisos en la configuración probada.",()=>{
    const roles=[Config.ROLES.ADMINISTRATIVO_CONTRATISTA,Config.ROLES.ANALISTA_DESPACHO,Config.ROLES.SUPERVISORES_OBRA_TLC,Config.ROLES.JEFE_OBRA_,Config.ROLES.GERENTE];
    const rows=[]; roles.forEach(r=>{rows.push([r,Config.MODULOS.ESTADO_OBRA,"SI"]);rows.push([r,Config.MODULOS.CONSULTA_PM,"SI"]);}); QA_Entorno.cargarPermisos(rows);
    roles.forEach(r=>{QA_Assert.ok(BLL_Usuario.tienePermiso(r,Config.MODULOS.ESTADO_OBRA,QA_PermisoRepoTest));QA_Assert.ok(BLL_Usuario.tienePermiso(r,Config.MODULOS.CONSULTA_PM,QA_PermisoRepoTest));});
    return roles;
  });

  q.caso("QA-P11","exigirPermiso bloquea acceso no autorizado","Debe lanzar ACCESO_DENEGADO.",()=>{
    QA_Entorno.cargarPermisos([]); let codigo=""; try{BLL_Usuario.exigirPermiso(Config.ROLES.DIRECTOR,Config.MODULOS.SUPERVISION_OBRA,QA_PermisoRepoTest);}catch(e){codigo=e.codigo||"";} QA_Assert.igual(codigo,"ACCESO_DENEGADO"); return codigo;
  });

  q.caso("QA-P12","Supervisión conserva acceso para Supervisor","SUPERVISOR con SUPERVISION_OBRA=SI mantiene CU01 disponible.",()=>{
    QA_Entorno.cargarPermisos([[Config.ROLES.SUPERVISOR,Config.MODULOS.SUPERVISION_OBRA,"SI"]]); QA_Assert.ok(BLL_Usuario.tienePermiso(Config.ROLES.SUPERVISOR,Config.MODULOS.SUPERVISION_OBRA,QA_PermisoRepoTest)); return "SUPERVISION_OBRA=true";
  });



  q.caso("QA-P13","Menú interno de Supervisión conserva el enrutamiento CU01","Iniciar nueva supervisión, Supervisiones en curso y Supervisiones finalizadas se delegan a GUI_Supervision aun sin estado conversacional.",()=>{
    const exigirOriginal=BLL_Usuario.exigirPermiso;
    const procesarOriginal=GUI_Supervision.procesar;
    const recibidos=[];
    try{
      BLL_Usuario.exigirPermiso=()=>true;
      GUI_Supervision.procesar=(chatId,telegramId,texto)=>{recibidos.push(String(texto||"")); return "DELEGADO";};
      const usuario={RolAprobado:Config.ROLES.SUPERVISOR};
      ["Iniciar nueva supervisión","Supervisiones en curso","Supervisiones finalizadas"].forEach(opcion=>{
        const resultado=GUI_Menu.procesar("QA_CHAT","QA_TELEGRAM",opcion,usuario,null,null);
        QA_Assert.igual(resultado,"DELEGADO");
      });
      QA_Assert.igual(recibidos.length,3);
      QA_Assert.igual(recibidos[0],"Iniciar nueva supervisión");
      QA_Assert.igual(recibidos[1],"Supervisiones en curso");
      QA_Assert.igual(recibidos[2],"Supervisiones finalizadas");
      return recibidos;
    }finally{
      BLL_Usuario.exigirPermiso=exigirOriginal;
      GUI_Supervision.procesar=procesarOriginal;
    }
  });

  const r=q.resumen(); QA_imprimir(r); return r;
}

function QA_Incremento_Permisos(){
  let rp=null,rs=null;
  try{
    QA_Entorno.preparar();
    rp=QA_Permisos();
    rs=QA_Sprint1();
    const combinado={grupo:"INCREMENTO PERMISOS + REGRESIÓN SPRINT1",total:rp.total+rs.total,ok:rp.ok+rs.ok,fallas:rp.fallas+rs.fallas,detalle:[].concat(rp.detalle,rs.detalle)};
    QA_imprimir(combinado);
    return combinado;
  }finally{
    QA_Entorno.limpiar();
    Logger.log(`[QA] ${QA_Entorno.verificarLimpieza()}`);
  }
}
