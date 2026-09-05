// ======================================================
// BLL_USUARIO.JS
// Reglas de negocio CU00: alta, aprobación y actividad.
// ======================================================
class BLL_Usuario {
  static _repo(repo){return repo||DAL_Usuario;}
  static _rolRepo(repo){return repo||DAL_Rol;}
  static _permisoRepo(repo){return repo||DAL_Permiso;}

  static tienePermiso(rol,modulo,permisoRepo=null){
    const r=String(rol||"").trim().toUpperCase();
    const m=String(modulo||"").trim().toUpperCase();
    if(!r||!m)return false;
    const permisos=this._permisoRepo(permisoRepo).listarPorRol(r);
    const especifico=permisos.filter(x=>x.Modulo===m).slice(-1)[0];
    if(especifico)return especifico.Permitido===Config.ACTIVO.SI;
    const wildcard=permisos.filter(x=>x.Modulo==="*").slice(-1)[0];
    return !!wildcard&&wildcard.Permitido===Config.ACTIVO.SI;
  }

  static exigirPermiso(rol,modulo,permisoRepo=null){
    exigir(this.tienePermiso(rol,modulo,permisoRepo),"ACCESO_DENEGADO","No tenés permiso para acceder a este módulo.");
    return true;
  }

  static obtenerModulosPermitidos(rol,permisoRepo=null){
    return Object.keys(Config.MODULOS).map(k=>Config.MODULOS[k]).filter(m=>this.tienePermiso(rol,m,permisoRepo));
  }

  static obtenerRolesPublicos(rolRepo=null){
    return this._rolRepo(rolRepo).listarActivos().filter(r=>r.Rol!==Config.ROLES.ADMINISTRADOR);
  }

  static obtenerRolSolicitablePorTexto(texto,rolRepo=null){
    const t=String(texto||"").trim().toUpperCase();
    return this.obtenerRolesPublicos(rolRepo).find(r=>r.Rol===t||String(r.Descripcion||"").trim().toUpperCase()===t)||null;
  }

  static _validarRolSolicitable(rol,rolRepo=null){
    const r=this._rolRepo(rolRepo).buscarPorRol(rol);
    exigir(r&&r.Activo===Config.ACTIVO.SI&&r.Rol!==Config.ROLES.ADMINISTRADOR,"ROL_NO_PERMITIDO","El rol solicitado no es válido.");
    return r;
  }

  static obtenerUsuarioPorTelegramId(id,repo=null){const r=this._repo(repo).buscarPorTelegramId(id); return r?MAP_Usuario.FilaaBE(r.datos):null;}
  static obtenerUsuarioPorCodUsuario(cod,repo=null){const r=this._repo(repo).buscarPorCodUsuario(cod); return r?MAP_Usuario.FilaaBE(r.datos):null;}

  static solicitarAlta(id,nombre,apellido,rol,repo=null,ahora=new Date(),rolRepo=null){
    repo=this._repo(repo);
    exigir(id&&nombre&&apellido,"DATOS_INCOMPLETOS","Faltan datos obligatorios.");
    this._validarRolSolicitable(rol,rolRepo);
    const ex=repo.buscarPorTelegramId(id);
    if(ex){
      const u=MAP_Usuario.FilaaBE(ex.datos);
      if(u.EstadoAprobacion!==Config.ESTADOS_APROBACION.RECHAZADO) throw new ErrorNegocio("USUARIO_EXISTENTE","El usuario ya se encuentra registrado.");
      u.Nombre=nombre;u.Apellido=apellido;u.RolSolicitado=rol;u.RolAprobado=null;u.CodUsuario=null;u.EstadoAprobacion=Config.ESTADOS_APROBACION.PENDIENTE;u.Activo=Config.ACTIVO.NO;u.FechaAlta=ahora;u.FechaAprobacion=null;u.AprobadoPor=null;u.UltimoAcceso=null;
      repo.actualizar(ex.fila,MAP_Usuario.BEaFila(u));return u;
    }
    const u=new BE_Usuario(id,nombre,apellido,rol,null,null,Config.ESTADOS_APROBACION.PENDIENTE,Config.ACTIVO.NO,ahora);
    repo.insertar(MAP_Usuario.BEaFila(u));return u;
  }

  static aprobarUsuario(id,codAprobador,repo=null,ahora=new Date(),rolRepo=null){
    repo=this._repo(repo); const r=repo.buscarPorTelegramId(id); exigir(r,"USUARIO_NO_EXISTE","Usuario no encontrado."); const u=MAP_Usuario.FilaaBE(r.datos);
    exigir(u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE||u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE_REACTIVACION,"ESTADO_INVALIDO","El usuario no está pendiente de aprobación/reactivación.");
    if(u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE){
      this._validarRolSolicitable(u.RolSolicitado,rolRepo);
      u.RolAprobado=u.RolSolicitado;u.CodUsuario=this._generarCodUsuario(u.RolAprobado,repo,rolRepo);u.FechaAprobacion=ahora;u.AprobadoPor=codAprobador;
    }
    u.EstadoAprobacion=Config.ESTADOS_APROBACION.APROBADO;u.Activo=Config.ACTIVO.SI;u.UltimoAcceso=ahora;repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return u;
  }

  static aprobarDesdeEdicionManual(id,estadoAnterior,codAprobador=Config.COD_ADMIN_SISTEMA,repo=null,ahora=new Date(),rolRepo=null){
    repo=this._repo(repo);
    exigir(estadoAnterior===Config.ESTADOS_APROBACION.PENDIENTE,"ESTADO_ANTERIOR_INVALIDO","La aprobación manual solo puede partir de una solicitud pendiente.");
    const r=repo.buscarPorTelegramId(id); exigir(r,"USUARIO_NO_EXISTE","Usuario no encontrado."); const u=MAP_Usuario.FilaaBE(r.datos);
    exigir(u.EstadoAprobacion===Config.ESTADOS_APROBACION.APROBADO,"ESTADO_INVALIDO","La hoja no contiene una aprobación válida.");
    this._validarRolSolicitable(u.RolSolicitado,rolRepo);
    exigir(!u.RolAprobado&&!u.CodUsuario,"USUARIO_YA_APROBADO","El usuario ya posee rol o código asignado.");
    u.RolAprobado=u.RolSolicitado;u.CodUsuario=this._generarCodUsuario(u.RolAprobado,repo,rolRepo);u.Activo=Config.ACTIVO.SI;u.FechaAprobacion=ahora;u.AprobadoPor=codAprobador;u.UltimoAcceso=null;
    repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return u;
  }

  static rechazarUsuario(id,codAprobador,repo=null,ahora=new Date()){repo=this._repo(repo);const r=repo.buscarPorTelegramId(id);exigir(r,"USUARIO_NO_EXISTE","Usuario no encontrado.");const u=MAP_Usuario.FilaaBE(r.datos);exigir(u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE,"ESTADO_INVALIDO","Solo se rechazan solicitudes pendientes.");u.EstadoAprobacion=Config.ESTADOS_APROBACION.RECHAZADO;u.Activo=Config.ACTIVO.NO;u.FechaAprobacion=ahora;u.AprobadoPor=codAprobador;repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return u;}

  static registrarAcceso(id,repo=null,ahora=new Date()){repo=this._repo(repo);const r=repo.buscarPorTelegramId(id);if(!r)return {estado:"NO_REGISTRADO",usuario:null};const u=MAP_Usuario.FilaaBE(r.datos);if(u.EstadoAprobacion===Config.ESTADOS_APROBACION.RECHAZADO)return {estado:"RECHAZADO",usuario:u};if(u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE)return {estado:"PENDIENTE",usuario:u};if(u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE_REACTIVACION)return {estado:"PENDIENTE_REACTIVACION",usuario:u};
    if(u.RolAprobado!==Config.ROLES.ADMINISTRADOR && u.UltimoAcceso && (ahora-new Date(u.UltimoAcceso))/86400000>=Config.DIAS_INACTIVIDAD){u.Activo=Config.ACTIVO.NO;u.EstadoAprobacion=Config.ESTADOS_APROBACION.PENDIENTE_REACTIVACION;repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return {estado:"PENDIENTE_REACTIVACION",usuario:u};}
    if(u.Activo!==Config.ACTIVO.SI){u.EstadoAprobacion=Config.ESTADOS_APROBACION.PENDIENTE_REACTIVACION;repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return {estado:"PENDIENTE_REACTIVACION",usuario:u};}u.UltimoAcceso=ahora;repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return {estado:"ACCESO_OK",usuario:u};
  }

  static _generarCodUsuario(rol,repo,rolRepo=null){
    const cfg=this._rolRepo(rolRepo).buscarPorRol(rol);
    const pref=cfg?String(cfg.PrefijoCod||"").trim().toUpperCase():"";
    exigir(/^[A-Z0-9]{3}$/.test(pref),"PREFIJO_ROL_INVALIDO","El rol aprobado no posee un prefijo de código válido.");
    let max=0;repo.listar().forEach(f=>{const c=String(f[5]||"");if(c.startsWith(pref)){const n=parseInt(c.slice(3),10);if(n>max)max=n;}});
    return pref+String(max+1).padStart(3,"0");
  }
}
