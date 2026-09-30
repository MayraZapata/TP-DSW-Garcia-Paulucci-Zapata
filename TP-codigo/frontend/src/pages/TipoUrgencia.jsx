import GestionCrud from "../components/GestionCrud";
import { crudTipoUrgencia } from "../config/cruds";

export default function TipoUrgencia() {
  return <GestionCrud {...crudTipoUrgencia} />;
}