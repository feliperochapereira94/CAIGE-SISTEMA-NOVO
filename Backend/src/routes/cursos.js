import express from 'express';
import {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/cursosController.js';
import { requireAuth, requireSupervisor } from '../controllers/acessoController.js';

const router = express.Router();

// Listar cursos â€” qualquer usuÃ¡rio autenticado (para popular selects)
router.get('/', requireAuth, listCourses);

// Gerenciar cursos â€” apenas supervisor
router.post('/', requireAuth, requireSupervisor, createCourse);
router.put('/:id', requireAuth, requireSupervisor, updateCourse);
router.delete('/:id', requireAuth, requireSupervisor, deleteCourse);

export default router;

