import GestionCrud from "../components/GestionCrud";
import { crudEspecialidad } from "../config/cruds";

export default function Especialidad() {
  return <GestionCrud {...crudEspecialidad} />;
}