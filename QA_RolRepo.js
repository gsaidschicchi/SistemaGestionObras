// ======================================================
// QA_ROLREPO.JS
// Catálogo de roles en memoria para pruebas BLL.
// No toca Sheets productivos.
// ======================================================
class QA_RolRepo {
  constructor(rows = null) {
    this.rows = rows || [
      {Rol:Config.ROLES.SUPERVISOR,Descripcion:"Supervisor",Activo:Config.ACTIVO.SI,PrefijoCod:"SUP"},
      {Rol:Config.ROLES.GERENTE,Descripcion:"Gerente",Activo:Config.ACTIVO.SI,PrefijoCod:"GER"},
      {Rol:Config.ROLES.DIRECTOR,Descripcion:"Director",Activo:Config.ACTIVO.SI,PrefijoCod:"DIR"},
      {Rol:Config.ROLES.ADMINISTRADOR,Descripcion:"Administrador",Activo:Config.ACTIVO.NO,PrefijoCod:"ADM"},
      {Rol:Config.ROLES.ADMINISTRATIVO_CONTRATISTA,Descripcion:"Administrativo Contratista",Activo:Config.ACTIVO.SI,PrefijoCod:"ADC"},
      {Rol:Config.ROLES.ANALISTA_DESPACHO,Descripcion:"Analista Despacho",Activo:Config.ACTIVO.SI,PrefijoCod:"ADE"},
      {Rol:Config.ROLES.SUPERVISORES_OBRA_TLC,Descripcion:"Supervisor Obra TLC",Activo:Config.ACTIVO.SI,PrefijoCod:"SOT"},
      {Rol:Config.ROLES.JEFE_OBRA_,Descripcion:"Jefe de Obra",Activo:Config.ACTIVO.SI,PrefijoCod:"JOB"}
    ];
  }
  listar(){return this.rows.map(x=>Object.assign({},x));}
  listarActivos(){return this.listar().filter(x=>x.Activo===Config.ACTIVO.SI);}
  buscarPorRol(rol){return this.listar().find(x=>x.Rol===String(rol||"").trim().toUpperCase())||null;}
}
