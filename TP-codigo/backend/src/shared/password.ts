import bcrypt from "bcryptjs";

const ROUNDS = 10;

//hashea la contraseña encriptada para guardarla en la base de datos
export const hashPassword = (plain: string) => bcrypt.hash(plain, ROUNDS);

//compara la contraseña encriptada con la contraseña ingresada por el usuario
export const verifyPassword = (plain: string, hash: string) =>
    bcrypt.compare(plain, hash);