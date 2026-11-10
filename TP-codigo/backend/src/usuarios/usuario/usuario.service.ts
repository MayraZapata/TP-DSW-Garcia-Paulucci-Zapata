import { EntityManager } from "@mikro-orm/core";
import { ErrorNegocio } from "../../shared/errorNegocio.js";
import { hashPassword } from "../../shared/password.js";
import type { Rol } from "../../shared/jwt.js";
import { Usuario } from "./usuario.entity.js";
import { CrearUsuarioDto } from "./usuario.dto.js";

//verificacion de disponibilidad de nombre de usuario
export async function nombreUsuarioLibre(em: EntityManager, nombreUsuario: string): Promise<boolean> {
    return (await em.count(Usuario, { nombreUsuario })) === 0;
}


// Crea la cuenta 
export async function crearUsuario(em: EntityManager, dto: CrearUsuarioDto, rol: Rol): Promise<Usuario> {
    const nombreUsuario = typeof dto.nombreUsuario === "string" ? dto.nombreUsuario.trim() : "";
    if (!nombreUsuario)
        throw new ErrorNegocio(400, "El nombre de usuario es obligatorio");
    if (typeof dto.password !== "string" || !dto.password)
        throw new ErrorNegocio(400, "La contraseña es obligatoria");

    if (!(await nombreUsuarioLibre(em, nombreUsuario)))
        throw new ErrorNegocio(400, "El nombre de usuario ya existe");

    const usuario = em.create(Usuario, {
        nombreUsuario,
        password: await hashPassword(dto.password),
        rol,
    });
    em.persist(usuario);
    return usuario;
}





//cambiar nombre de usuario
export async function cambiarNombreUsuario(em: EntityManager, usuario: Usuario, nuevo: string) {
    if (nuevo === usuario.nombreUsuario) return;
    if (!(await nombreUsuarioLibre(em, nuevo)))
        throw new ErrorNegocio(400, "El nombre de usuario ya existe");
    usuario.nombreUsuario = nuevo;
}




export async function establecerPassword(usuario: Usuario, passwordPlano: string) {
    usuario.password = await hashPassword(passwordPlano);
}