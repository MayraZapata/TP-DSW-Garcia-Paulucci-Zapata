import { Request, Response, NextFunction } from "express";
import { verificarToken, TokenPayload, Rol } from "./jwt.js";
import { COOKIE_NAME } from "./cookie.js";

// Le avisa a TypeScript que `req` puede traer `auth`
declare global {
    namespace Express {
        interface Request {
            auth?: TokenPayload;
        }
    }
}


// ¿Hay una sesión válida? Si sí, deja { rol, id } en req.auth
export function autenticar(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "No autenticado" });

    try {
        req.auth = verificarToken(token);
        next();
    } catch {
        return res.status(401).json({ message: "Sesión inválida o vencida" });
    }
}





// ¿Su rol está permitido? Va siempre DESPUÉS de autenticar
export function autorizar(...roles: Rol[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.auth || !roles.includes(req.auth.rol)) {
            return res.status(403).json({ message: "No tenés permiso para esta acción" });
        }
        next();
    };
}







export function soloPropio(rol: Rol, parametro: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.auth?.rol === rol && Number(req.params[parametro]) !== req.auth.id) {
            return res.status(403).json({ message: "No podés acceder a datos de otra persona" });
        }
        next();
    };
}