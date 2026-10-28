import { Request, Response } from "express";
import * as consultaService from "./consulta.service.js";

export async function findAll(req: Request, res: Response) {
  res.json(await consultaService.listar());
}

export async function add(req: Request, res: Response) {
  const resultado = await consultaService.crear(req.body, req.auth);
  res.status(201).json(resultado);
}

export async function findByPaciente(req: Request, res: Response) {
  res.json(await consultaService.listarPorPaciente(Number(req.params.idPaciente)));
}

export async function findByMedico(req: Request, res: Response) {
  res.json(await consultaService.listarPorMedico(Number(req.params.matricula)));
}

export async function cancelarTurno(req: Request, res: Response) {
  const resultado = await consultaService.cancelar(Number(req.params.idAtencion), req.auth);
  res.json(resultado);
}

export async function cambiarEstado(req: Request, res: Response) {
  const resultado = await consultaService.cambiarEstado(Number(req.params.idAtencion), req.body.estado, req.auth);
  res.json(resultado);
}

export async function completarAtencion(req: Request, res: Response) {
  const { idDiagnostico, estado } = req.body;
  const resultado = await consultaService.completarAtencion(Number(req.params.idAtencion), idDiagnostico, estado, req.auth);
  res.json(resultado);
}

export async function buscarTurnos(req: Request, res: Response) {
  res.json(await consultaService.buscar(req.query, req.auth));
}

export async function getHorariosOcupados(req: Request, res: Response) {
  res.json(await consultaService.obtenerHorariosOcupados(req.query));
}

export async function historialPorPaciente(req: Request, res: Response) {
  res.json(await consultaService.historialPorPaciente(Number(req.params.idPaciente)));
}

export async function historialPorDni(req: Request, res: Response) {
  res.json(await consultaService.historialPorDni(req.params.dni as string));
}