import GestionCrud from "../components/GestionCrud";
import { crudDiagnostico } from "../config/cruds";

export default function Diagnostico() {
  return <GestionCrud {...crudDiagnostico} />;
}