import GestionCrud from "../components/GestionCrud";
import { crudObraSocial } from "../config/cruds";

export default function ObraSocial() {
  return <GestionCrud {...crudObraSocial} />;
}