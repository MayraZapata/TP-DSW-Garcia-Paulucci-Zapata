import { orm } from "../../shared/orm.js";
import { Administrador } from "./Administrador.entity.js";
const em = orm.em;
export async function findOnlyOne(req, res) {
    const administrador = await em.find(Administrador, {});
    if (!administrador)
        return res.sendStatus(404);
    res.json(administrador);
}
//# sourceMappingURL=administrador.controller.js.map