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
import { ObraSocial } from "../cualidadesUsr/obraSocial/obraSocial.entity.js";
//import { Atencion } from "../../turno/atencion/Atencion.entity.js";
import { Usuario } from "../usuario.abstract.js";
let Paciente = class Paciente extends Usuario {
};
__decorate([
    PrimaryKey({ fieldName: "idPaciente" }),
    __metadata("design:type", Number)
], Paciente.prototype, "idPaciente", void 0);
__decorate([
    Property(),
    __metadata("design:type", String)
], Paciente.prototype, "nombre", void 0);
__decorate([
    Property(),
    __metadata("design:type", String)
], Paciente.prototype, "apellido", void 0);
__decorate([
    Property(),
    __metadata("design:type", String)
], Paciente.prototype, "dni", void 0);
__decorate([
    ManyToOne(() => ObraSocial, { fieldName: "idObra", nullable: true }),
    __metadata("design:type", ObraSocial)
], Paciente.prototype, "obraSocial", void 0);
Paciente = __decorate([
    Entity()
], Paciente);
export { Paciente };
//# sourceMappingURL=paciente.entity.js.map