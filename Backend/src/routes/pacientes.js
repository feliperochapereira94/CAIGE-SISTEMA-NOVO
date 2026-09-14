import express from "express";
import {
  getAllPatients,
  getPatient,
  createPatient,
  updatePatient,
  updatePatientStatus,
  deletePatient
} from "../controllers/pacientesController.js";
import { requireAuth, requirePermission } from "../controllers/acessoController.js";

const router = express.Router();

// Listar todos os pacientes operacionais - requer pode_visualizar_paciente
router.get("/", requireAuth, requirePermission('pode_visualizar_paciente'), getAllPatients);

// Obter paciente específico - requer pode_visualizar_paciente
router.get("/:id", requireAuth, requirePermission('pode_visualizar_paciente'), getPatient);

// Criar novo paciente - requer pode_criar_paciente
router.post("/", requireAuth, requirePermission('pode_criar_paciente'), createPatient);

// Atualizar paciente - requer pode_editar_paciente
router.put("/:id", requireAuth, requirePermission('pode_editar_paciente'), updatePatient);

// Alterar status do paciente (inativar / reativar) - requer pode_editar_paciente
router.patch("/:id/status", requireAuth, requirePermission('pode_editar_paciente'), updatePatientStatus);

// Arquivar paciente (apenas inativos) - requer pode_editar_paciente
router.delete("/:id", requireAuth, requirePermission('pode_editar_paciente'), deletePatient);

export default router;
