import { Request, Response } from "express";
import * as loginService from "./login.service.js";
import { firmarToken } from "../shared/jwt.js";
import { COOKIE_NAME, opcionesCookie } from "../shared/cookie.js";


//inicio sesion
export async function login(req: Request, res: Response) {
    const { usuario, password } = req.body ?? {};

    const sesion = await loginService.autenticar(usuario, password);
    const token = firmarToken({ rol: sesion.rol, id: sesion.id });
    res.cookie(COOKIE_NAME, token, opcionesCookie);

    res.json({ rol: sesion.rol, usuario: sesion.usuario });
}

// Devuelve la sesión actual
export async function me(req: Request, res: Response) {
    const { rol, id } = req.auth!;
    res.json(await loginService.obtenerSesion(rol, id));
}


//cerrar sesion
export function logout(_req: Request, res: Response) {
    res.clearCookie(COOKIE_NAME, opcionesCookie);
    res.sendStatus(204);
}


//Cambiar contraseña
export async function cambiarPassword(req: Request, res: Response) {
    const { passwordActual, passwordNueva } = req.body ?? {};

    await loginService.cambiarPassword(req.auth!.rol, req.auth!.id, passwordActual, passwordNueva);

    res.json({ message: "Contraseña actualizada" });
}