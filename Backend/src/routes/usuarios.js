import express from 'express';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/usuariosController.js';
import { requireAuth, requireSupervisor } from '../controllers/acessoController.js';

const router = express.Router();

// Listar usuÃ¡rios (apenas supervisor)
router.get('/', requireAuth, requireSupervisor, listUsers);

// Criar novo usuÃ¡rio (apenas supervisor)
router.post('/', requireAuth, requireSupervisor, createUser);

// Editar usuÃ¡rio (apenas supervisor)
router.put('/:id', requireAuth, requireSupervisor, updateUser);

// Desabilitar usuÃ¡rio definitivamente (apenas supervisor)
router.delete('/:id', requireAuth, requireSupervisor, deleteUser);

export default router;

