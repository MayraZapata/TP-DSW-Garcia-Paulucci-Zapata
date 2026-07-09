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
import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { Diagnostico } from "../diagnostico/diagnostico.entity.js";
import { TipoUrgencia } from "../tipoUrgencia/tipoUrgencia.entity.js";
export let Atencion = class Atencion {
};
__decorate([
    PrimaryKey(),
    __metadata("design:type", Number)
], Atencion.prototype, "idAtencion", void 0);
__decorate([
    Property(),
    __metadata("design:type", Date)
], Atencion.prototype, "fechaAtencion", void 0);
__decorate([
    Property(),
    __metadata("design:type", String)
], Atencion.prototype, "horaAtencion", void 0);
__decorate([
    Property(),
    __metadata("design:type", Number)
], Atencion.prototype, "nroIngreso", void 0);
__decorate([
    Property({ nullable: true }),
    __metadata("design:type", String)
], Atencion.prototype, "estado", void 0);
__decorate([
    ManyToOne(() => Paciente),
    __metadata("design:type", Paciente)
], Atencion.prototype, "paciente", void 0);
__decorate([
    ManyToOne(() => Medico),
    __metadata("design:type", Medico)
], Atencion.prototype, "medico", void 0);
__decorate([
    ManyToOne(() => Diagnostico, { nullable: true }),
    __metadata("design:type", Diagnostico)
], Atencion.prototype, "diagnostico", void 0);
__decorate([
    ManyToOne(() => TipoUrgencia, { nullable: true }),
    __metadata("design:type", TipoUrgencia)
], Atencion.prototype, "tipoUrgencia", void 0);
Atencion = __decorate([
    Entity()
], Atencion);
//# sourceMappingURL=Atencion.entity.js.map