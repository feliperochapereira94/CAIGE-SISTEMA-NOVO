import pool from "../models/database.js";
import { obterMovimentacoesRecentes } from "../models/movimentacoesModel.js";
import { parsePagination, parsePositiveInt } from "../models/validacaoModel.js";

/**
 * GET /movimentacoes/recentes
 * Obtém movimentações recentes
 * Query params:
 *  - limit: número de registros (padrão: 20, máximo: 100)
 *  - offset: paginação (padrão: 0)
 *  - tipo: filtrar por tipo de movimentação
 *  - id_usuario: filtrar por usuário
 *  - id_paciente: filtrar por paciente
 */
export async function getMovimentacoesRecentes(req, res) {
  try {
    const professor = req.user?.role === "PROFESSOR";

    if (professor && !req.user?.idCurso) {
      return res.status(403).json({ message: "Usuário sem curso vinculado" });
    }

    const { limit, offset } = parsePagination(
      req.query.limit,
      req.query.offset,
      { limit: 20, maxLimit: 100 }
    );

    const filtros = {
      limit,
      offset,
      id_usuario: req.query.id_usuario ? parsePositiveInt(req.query.id_usuario) : null,
      id_paciente: req.query.id_paciente ? parsePositiveInt(req.query.id_paciente) : null,
      id_curso: professor ? parsePositiveInt(req.user.idCurso) : null,
      tipo: req.query.tipo || null
    };

    // Obter movimentações
    const movimentacoes = await obterMovimentacoesRecentes(filtros);

    // Contar total
    let countQuery = "SELECT COUNT(*) AS total FROM movimentacoes WHERE 1 = 1";
    const countParams = [];

    if (filtros.id_usuario) {
      countQuery += " AND id_usuario = ?";
      countParams.push(filtros.id_usuario);
    }
    if (filtros.id_paciente) {
      countQuery += " AND id_paciente = ?";
      countParams.push(filtros.id_paciente);
    }
    if (filtros.id_curso) {
      countQuery += " AND id_curso = ?";
      countParams.push(filtros.id_curso);
    }
    if (filtros.tipo) {
      countQuery += " AND tipo = ?";
      countParams.push(filtros.tipo);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    return res.status(200).json({
      data: movimentacoes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      message: "Movimentações recuperadas com sucesso"
    });
  } catch (error) {
    console.error("Erro ao recuperar movimentações:", error);
    return res.status(500).json({ message: "Erro ao recuperar movimentações" });
  }
}
