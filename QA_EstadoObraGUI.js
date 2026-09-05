// ======================================================
// QA_ESTADOOBRAGUI.JS
// Regresión del flujo Telegram de Estado de Obra.
// ======================================================
function QA_EstadoObraGUI(){
  const q=new QA_Runner("SPRINT2A - ESTADO DE OBRA / GUI");
  const usuario={Nombre:"QA",RolAprobado:Config.ROLES.GERENTE};

  q.caso("QA-G01","Menú expone Estado de Obra con permiso","El módulo aparece cuando BLL devuelve ESTADO_OBRA como permitido.",()=>{
    const a=BLL_Usuario.obtenerModulosPermitidos,b=TelegramService.enviarMensaje;
    let markup=null;
    try{BLL_Usuario.obtenerModulosPermitidos=()=>[Config.MODULOS.ESTADO_OBRA];TelegramService.enviarMensaje=(c,t,m)=>{markup=m;return "OK";};GUI_Menu.mostrar("C",usuario);const flat=(markup.keyboard||[]).flat();QA_Assert.ok(flat.includes("Estado de Obra"));return flat;}finally{BLL_Usuario.obtenerModulosPermitidos=a;TelegramService.enviarMensaje=b;}
  });

  q.caso("QA-G02","Router delega Estado de Obra","El texto Estado de Obra exige permiso e inicia GUI_EstadoObra.",()=>{
    const a=BLL_Usuario.exigirPermiso,b=BLL_SesionTelegram.limpiar,c=GUI_EstadoObra.iniciar;let iniciado=false;
    try{BLL_Usuario.exigirPermiso=()=>true;BLL_SesionTelegram.limpiar=()=>true;GUI_EstadoObra.iniciar=()=>{iniciado=true;return "OK";};const r=GUI_Menu.procesar("C","T","Estado de Obra",usuario,null,null);QA_Assert.igual(r,"OK");QA_Assert.ok(iniciado);return "Delegado";}finally{BLL_Usuario.exigirPermiso=a;BLL_SesionTelegram.limpiar=b;GUI_EstadoObra.iniciar=c;}
  });

  q.caso("QA-G03","Una sola coincidencia igual exige selección","La búsqueda nunca auto-selecciona la primera obra.",()=>{
    const a=DAL_Tarea.buscarObras,b=BLL_SesionTelegram.guardar,c=TelegramService.enviarMensaje;let estado="",markup=null;
    try{DAL_Tarea.buscarObras=()=>["QU726AF"];BLL_SesionTelegram.guardar=(id,e)=>{estado=e;};TelegramService.enviarMensaje=(ch,t,m)=>{markup=m;return "OK";};GUI_EstadoObra._buscar("C","T","QU726");QA_Assert.igual(estado,"EST_SELECCION_OBRA");QA_Assert.ok((markup.keyboard||[]).flat().includes("QU726AF"));return estado;}finally{DAL_Tarea.buscarObras=a;BLL_SesionTelegram.guardar=b;TelegramService.enviarMensaje=c;}
  });

  q.caso("QA-G04","Sin coincidencias permite reintentar","La sesión vuelve a EST_BUSCAR_OBRA.",()=>{
    const a=DAL_Tarea.buscarObras,b=BLL_SesionTelegram.guardar,c=TelegramService.enviarMensaje;let estado="";
    try{DAL_Tarea.buscarObras=()=>[];BLL_SesionTelegram.guardar=(id,e)=>{estado=e;};TelegramService.enviarMensaje=()=>"OK";GUI_EstadoObra._buscar("C","T","ZZZ");QA_Assert.igual(estado,"EST_BUSCAR_OBRA");return estado;}finally{DAL_Tarea.buscarObras=a;BLL_SesionTelegram.guardar=b;TelegramService.enviarMensaje=c;}
  });

  q.caso("QA-G05","Resumen conserva formato funcional","Muestra cabecera, métricas, excepciones y advertencia exacta.",()=>{
    const a=BLL_EstadoObra.obtenerResumenPorObra,b=BLL_EstadoObra.obtenerInformacionCabecera,c=TelegramService.enviarMensaje;let texto="";
    try{BLL_EstadoObra.obtenerResumenPorObra=()=>({totalTareas:10,tareasCompletadasEC:8,tareasAprobadasSupervision:7,tareasConsumoCRM:6,tareasPendientesEjecucionEC:2,tareasPendientesAprobacionSupervision:1,tareasPendientesConsumoCRM:1,rechazoAdministrativo:1,tareasCanceladas:2,rechazoTotalSupervision:1,pendientesCierreMaterialesCRM:1});BLL_EstadoObra.obtenerInformacionCabecera=()=>({fechaActualizacion:new Date(2026,8,5,12,0),ec:"EC QA",estadoLiquidacion:"Pendiente de liquidación"});TelegramService.enviarMensaje=(ch,t)=>{texto=t;return "OK";};GUI_EstadoObra._mostrarResumen("C","QU726AF");["RESUMEN GENERAL","Obra: QU726AF","EC: EC QA","Estado de liquidación: Pendiente de liquidación","TOTAL","AVANCE","PENDIENTES","OBSERVACIONES / EXCEPCIONES","La información proviene de un reporte operativo que puede presentar un desfase de hasta 24 hs respecto a la realidad."].forEach(x=>QA_Assert.ok(texto.includes(x)));return "Formato OK";}finally{BLL_EstadoObra.obtenerResumenPorObra=a;BLL_EstadoObra.obtenerInformacionCabecera=b;TelegramService.enviarMensaje=c;}
  });

  q.caso("QA-G06","Detalle usa campos acordados","Avance usa Ticket+estado correspondiente y no fabrica Dirección.",()=>{
    const a=BLL_EstadoObra.obtenerResumenPorObra,b=GUI_EstadoObra._enviarLargo;let texto="";const t=new BE_Tarea("000123","QU726AF","COMPLETADA","APROBADA","SIN INICIAR");
    try{BLL_EstadoObra.obtenerResumenPorObra=()=>({detalle:{completadasEC:[t],aprobadasSupervision:[t],consumoCRM:[],pendientesEjecucionEC:[],pendientesAprobacionSupervision:[],pendientesConsumoCRM:[],rechazoAdministrativo:[],canceladas:[],rechazoTotalSupervision:[],pendientesCierreMaterialesCRM:[]}});GUI_EstadoObra._enviarLargo=(ch,tx)=>{texto=tx;return "OK";};GUI_EstadoObra._mostrarDetalle("C","QU726AF","AVANCE");QA_Assert.ok(texto.includes("000123 | COMPLETADA"));QA_Assert.ok(texto.includes("000123 | APROBADA"));QA_Assert.ok(!texto.toUpperCase().includes("DIRECCIÓN"));return texto;}finally{BLL_EstadoObra.obtenerResumenPorObra=a;GUI_EstadoObra._enviarLargo=b;}
  });

  q.caso("QA-G07","Estado conversacional revalida permiso","Una sesión EST_ vuelve a exigir ESTADO_OBRA antes de delegar.",()=>{
    const a=BLL_Usuario.exigirPermiso,b=GUI_EstadoObra.procesar;let modulo="";
    try{BLL_Usuario.exigirPermiso=(rol,m)=>{modulo=m;};GUI_EstadoObra.procesar=()=>"OK";const r=GUI_Menu.procesar("C","T","x",usuario,{EstadoConversacion:"EST_RESUMEN"},null);QA_Assert.igual(r,"OK");QA_Assert.igual(modulo,Config.MODULOS.ESTADO_OBRA);return modulo;}finally{BLL_Usuario.exigirPermiso=a;GUI_EstadoObra.procesar=b;}
  });

  q.caso("QA-G08","Liquidación ausente no se inventa","Sin fuente disponible la cabecera devuelve Sin información de liquidación.",()=>{
    const obraRepo={buscarLocalizadorDestinoPorObra:()=>""};const liqRepo={buscarPorObra:()=>null};const old=ConsolidadoUpdateService.obtenerInfoActualizacion;
    try{ConsolidadoUpdateService.obtenerInfoActualizacion=()=>({fechaDatos:null,archivo:""});const r=BLL_EstadoObra.obtenerInformacionCabecera("QU726AF",obraRepo,{buscarPorLocalizador:()=>null},liqRepo);QA_Assert.igual(r.estadoLiquidacion,"Sin información de liquidación");return r;}finally{ConsolidadoUpdateService.obtenerInfoActualizacion=old;}
  });

  const r=q.resumen();QA_imprimir(r);return r;
}

function QA_Incremento_EstadoObraTelegram(){
  let re=null,rg=null,rp=null,rs=null;
  try{
    QA_Entorno.preparar();
    re=QA_EstadoObra();
    rg=QA_EstadoObraGUI();
    rp=QA_Permisos();
    rs=QA_Sprint1();
    const combinado={grupo:"INCREMENTO ESTADO OBRA TELEGRAM + PERMISOS + REGRESIÓN SPRINT1",total:re.total+rg.total+rp.total+rs.total,ok:re.ok+rg.ok+rp.ok+rs.ok,fallas:re.fallas+rg.fallas+rp.fallas+rs.fallas,detalle:[].concat(re.detalle,rg.detalle,rp.detalle,rs.detalle)};
    QA_imprimir(combinado);return combinado;
  }finally{QA_Entorno.limpiar();Logger.log(`[QA] ${QA_Entorno.verificarLimpieza()}`);}
}
