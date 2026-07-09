var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
export let TipoUrgencia = class TipoUrgencia {
};
__decorate([
    PrimaryKey({ fieldName: "idTipo" }),
    __metadata("design:type", Number)
], TipoUrgencia.prototype, "idTipo", void 0);
__decorate([
    Property(),
    __metadata("design:type", String)
], TipoUrgencia.prototype, "nombre", void 0);
__decorate([
    Property({ fieldName: "descripcionTipo", nullable: true }),
    __metadata("design:type", String)
], TipoUrgencia.prototype, "descripcionTipo", void 0);
TipoUrgencia = __decorate([
    Entity({ tableName: "TipoUrgencia" })
], TipoUrgencia);
//# sourceMappingURL=tipoUrgencia.entity.js.map