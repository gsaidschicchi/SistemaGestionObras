// ======================================================
// BLL_USUARIO.GS
// Reglas de negocio CU00: alta, aprobación y actividad.
// ======================================================
class BLL_Usuario {
  static _repo(repo){return repo||DAL_Usuario;}
  static _rolesPublicos(){return [Config.ROLES.SUPERVISOR,Config.ROLES.GERENTE,Config.ROLES.DIRECTOR];}
  static obtenerUsuarioPorTelegramId(id,repo=null){const r=this._repo(repo).buscarPorTelegramId(id); return r?MAP_Usuario.FilaaBE(r.datos):null;}
  static solicitarAlta(id,nombre,apellido,rol,repo=null,ahora=new Date()){
    repo=this._repo(repo); exigir(id&&nombre&&apellido,"DATOS_INCOMPLETOS","Faltan datos obligatorios."); exigir(this._rolesPublicos().includes(rol),"ROL_NO_PERMITIDO","El rol solicitado no es válido.");
    const ex=repo.buscarPorTelegramId(id);
    if(ex){ const u=MAP_Usuario.FilaaBE(ex.datos); if(u.EstadoAprobacion!==Config.ESTADOS_APROBACION.RECHAZADO) throw new ErrorNegocio("USUARIO_EXISTENTE","El usuario ya se encuentra registrado."); u.Nombre=nombre;u.Apellido=apellido;u.RolSolicitado=rol;u.RolAprobado=null;u.CodUsuario=null;u.EstadoAprobacion=Config.ESTADOS_APROBACION.PENDIENTE;u.Activo=Config.ACTIVO.NO;u.FechaAlta=ahora;u.FechaAprobacion=null;u.AprobadoPor=null;u.UltimoAcceso=null;repo.actualizar(ex.fila,MAP_Usuario.BEaFila(u));return u; }
    const u=new BE_Usuario(id,nombre,apellido,rol,null,null,Config.ESTADOS_APROBACION.PENDIENTE,Config.ACTIVO.NO,ahora); repo.insertar(MAP_Usuario.BEaFila(u)); return u;
  }
  static aprobarUsuario(id,codAprobador,repo=null,ahora=new Date()){
    repo=this._repo(repo); const r=repo.buscarPorTelegramId(id); exigir(r,"USUARIO_NO_EXISTE","Usuario no encontrado."); const u=MAP_Usuario.FilaaBE(r.datos); exigir(u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE||u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE_REACTIVACION,"ESTADO_INVALIDO","El usuario no está pendiente de aprobación/reactivación.");
    if(u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE){u.RolAprobado=u.RolSolicitado;u.CodUsuario=this._generarCodUsuario(u.RolAprobado,repo);u.FechaAprobacion=ahora;u.AprobadoPor=codAprobador;} u.EstadoAprobacion=Config.ESTADOS_APROBACION.APROBADO;u.Activo=Config.ACTIVO.SI;u.UltimoAcceso=ahora;repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return u;
  }
  static aprobarDesdeEdicionManual(id,estadoAnterior,codAprobador=Config.COD_ADMIN_SISTEMA,repo=null,ahora=new Date()){
    repo=this._repo(repo);
    exigir(estadoAnterior===Config.ESTADOS_APROBACION.PENDIENTE,"ESTADO_ANTERIOR_INVALIDO","La aprobación manual solo puede partir de una solicitud pendiente.");
    const r=repo.buscarPorTelegramId(id);
    exigir(r,"USUARIO_NO_EXISTE","Usuario no encontrado.");
    const u=MAP_Usuario.FilaaBE(r.datos);
    exigir(u.EstadoAprobacion===Config.ESTADOS_APROBACION.APROBADO,"ESTADO_INVALIDO","La hoja no contiene una aprobación válida.");
    exigir(u.RolSolicitado&&this._rolesPublicos().includes(u.RolSolicitado),"ROL_NO_PERMITIDO","El rol solicitado no es válido.");
    exigir(!u.RolAprobado&&!u.CodUsuario,"USUARIO_YA_APROBADO","El usuario ya posee rol o código asignado.");
    u.RolAprobado=u.RolSolicitado;
    u.CodUsuario=this._generarCodUsuario(u.RolAprobado,repo);
    u.Activo=Config.ACTIVO.SI;
    u.FechaAprobacion=ahora;
    u.AprobadoPor=codAprobador;
    u.UltimoAcceso=null;
    repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));
    return u;
  }
  static rechazarUsuario(id,codAprobador,repo=null,ahora=new Date()){repo=this._repo(repo);const r=repo.buscarPorTelegramId(id);exigir(r,"USUARIO_NO_EXISTE","Usuario no encontrado.");const u=MAP_Usuario.FilaaBE(r.datos);exigir(u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE,"ESTADO_INVALIDO","Solo se rechazan solicitudes pendientes.");u.EstadoAprobacion=Config.ESTADOS_APROBACION.RECHAZADO;u.Activo=Config.ACTIVO.NO;u.FechaAprobacion=ahora;u.AprobadoPor=codAprobador;repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return u;}
  static registrarAcceso(id,repo=null,ahora=new Date()){repo=this._repo(repo);const r=repo.buscarPorTelegramId(id);if(!r)return {estado:"NO_REGISTRADO",usuario:null};const u=MAP_Usuario.FilaaBE(r.datos);if(u.EstadoAprobacion===Config.ESTADOS_APROBACION.RECHAZADO)return {estado:"RECHAZADO",usuario:u};if(u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE)return {estado:"PENDIENTE",usuario:u};if(u.EstadoAprobacion===Config.ESTADOS_APROBACION.PENDIENTE_REACTIVACION)return {estado:"PENDIENTE_REACTIVACION",usuario:u};
    if(u.RolAprobado!==Config.ROLES.ADMINISTRADOR && u.UltimoAcceso && (ahora-new Date(u.UltimoAcceso))/86400000>=Config.DIAS_INACTIVIDAD){u.Activo=Config.ACTIVO.NO;u.EstadoAprobacion=Config.ESTADOS_APROBACION.PENDIENTE_REACTIVACION;repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return {estado:"PENDIENTE_REACTIVACION",usuario:u};}
    if(u.Activo!==Config.ACTIVO.SI){u.EstadoAprobacion=Config.ESTADOS_APROBACION.PENDIENTE_REACTIVACION;repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return {estado:"PENDIENTE_REACTIVACION",usuario:u};}u.UltimoAcceso=ahora;repo.actualizar(r.fila,MAP_Usuario.BEaFila(u));return {estado:"ACCESO_OK",usuario:u};
  }
  static _generarCodUsuario(rol,repo){const pref={[Config.ROLES.SUPERVISOR]:"SUP",[Config.ROLES.GERENTE]:"GER",[Config.ROLES.DIRECTOR]:"DIR",[Config.ROLES.ADMINISTRADOR]:"ADM"}[rol]; exigir(pref,"ROL_NO_PERMITIDO","Rol aprobado inválido.");let max=0;repo.listar().forEach(f=>{const c=String(f[5]||"");if(c.startsWith(pref)){const n=parseInt(c.slice(3),10);if(n>max)max=n;}});return pref+String(max+1).padStart(3,"0");}
}
