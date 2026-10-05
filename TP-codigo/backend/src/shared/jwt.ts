import jwt from "jsonwebtoken";

export type Rol = "ADMIN" | "MEDICO" | "PACIENTE";

export interface TokenPayload {
    rol: Rol;
    id: number; 
}

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("Falta JWT_SECRET en el archivo .env");

const EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "2h") as jwt.SignOptions["expiresIn"];

export function firmarToken(payload: TokenPayload) {
    return jwt.sign(payload, SECRET!, { expiresIn: EXPIRES_IN });
}

export function verificarToken(token: string): TokenPayload {
    return jwt.verify(token, SECRET!, { algorithms: ["HS256"] }) as TokenPayload;
}