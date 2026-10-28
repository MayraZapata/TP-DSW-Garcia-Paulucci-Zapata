import { Request, Response, NextFunction } from "express";


// Lo lanzan los services; lo convierte en respuesta HTTP el middleware de abajo.
export class ErrorNegocio extends Error {
    constructor(public status: number, message: string, public extra: object = {}) {
        super(message);
        this.name = "ErrorNegocio";
    }
}


export function manejarErrores(error: any, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) return next(error);

    // Error del negocio y validación
    if (error instanceof ErrorNegocio) {
        return res.status(error.status).json({ message: error.message, ...error.extra });
    }

    // Errores 4xx de Express
    const status = error?.status ?? error?.statusCode;
    if (status >= 400 && status < 500) {
        return res.status(status).json({ message: "Solicitud inválida" });
    }

    // Cualquier otra cosa  (un bug o una falla de la base)
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
}