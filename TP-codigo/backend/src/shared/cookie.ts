import { CookieOptions } from "express";

export const COOKIE_NAME = "token";

export const opcionesCookie: CookieOptions = {
    httpOnly: true,   // JavaScript del navegador no puede leerla (protege de XSS)
    sameSite: "lax",  // el navegador no la manda en requests iniciados desde otros sitios (protege de CSRF)
    secure: process.env.NODE_ENV === "production", // solo por HTTPS cuando esté en producción
};