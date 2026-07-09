import { orm } from "../shared/orm.js";
import { Paciente } from "./paciente/paciente.entity.js";
import { Medico } from "./medico/medico.entity.js";
import { Administrador } from "./administrador/Administrador.entity.js";
const em = orm.em;
export async function existeUsuario(nombreUsuario) {
    const paciente = await em.findOne(Paciente, {
        nombreUsuario
    });
    if (paciente)
        return true;
    const medico = await em.findOne(Medico, {
        nombreUsuario
    });
    if (medico)
        return true;
    const administrador = await em.findOne(Administrador, {
        nombreUsuario
    });
    return administrador != null;
}
//# sourceMappingURL=existeUsuario.js.map