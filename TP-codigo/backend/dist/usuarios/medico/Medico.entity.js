var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { Especialidad } from "../cualidadesUsr/especialidad/especialidad.entity.js";
//import { Atencion } from "../../turno/atencion/Atencion.entity.js";
import { Usuario } from "../usuario.abstract.js";
let Medico = class Medico extends Usuario {
};
__decorate([
    PrimaryKey(),
    __metadata("design:type", Number)
], Medico.prototype, "matricula", void 0);
__decorate([
    Property(),
    __metadata("design:type", String)
], Medico.prototype, "nombre", void 0);
__decorate([
    Property(),
    __metadata("design:type", String)
], Medico.prototype, "apellido", void 0);
__decorate([
    ManyToOne(() => Especialidad, { fieldName: "idEspecialidad", nullable: true }),
    __metadata("design:type", Especialidad)
], Medico.prototype, "especialidad", void 0);
Medico = __decorate([
    Entity()
], Medico);
export { Medico };
//# sourceMappingURL=medico.entity.js.map