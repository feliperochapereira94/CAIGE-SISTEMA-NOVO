import pool from '../models/database.js';
import { registrarMovimentacao } from '../models/movimentacoesModel.js';
import { parsePositiveInt } from '../models/validacaoModel.js';

async function obterAtividadeComCurso(idAtividade) {
  const [atividades] = await pool.query(
    `
      SELECT aa.id, aa.id_curso AS idCurso, c.nome AS curso, aa.nome, aa.descricao,
             aa.ativo, aa.criado_em AS criadoEm, aa.atualizado_em AS atualizadoEm
      FROM atividades_atendimento aa
      JOIN cursos c ON c.id = aa.id_curso
      WHERE aa.id = ?
    `,
    [idAtividade]
  );

  return atividades[0] || null;
}

export async function listarAtividadesAtendimento(req, res) {
  try {
    const idCurso = req.query.idCurso ? parsePositiveInt(req.query.idCurso) : null;
    const parametros = [];
    let consulta = `
      SELECT aa.id, aa.id_curso AS idCurso, c.nome AS curso, aa.nome, aa.descricao,
             aa.ativo, aa.criado_em AS criadoEm, aa.atualizado_em AS atualizadoEm
      FROM atividades_atendimento aa
      JOIN cursos c ON c.id = aa.id_curso
      WHERE 1 = 1`;

    if (req.user?.role !== 'SUPERVISOR') {
      if (!req.user?.idCurso) {
        return res.status(403).json({ message: 'Usuário sem curso vinculado' });
      }

      if (idCurso && idCurso !== req.user.idCurso) {
        return res.status(403).json({ message: 'Você não pode acessar atividades de outro curso' });
      }

      consulta += ' AND aa.id_curso = ?';
      parametros.push(req.user.idCurso);
    }

    if (idCurso) {
      consulta += ' AND aa.id_curso = ?';
      parametros.push(idCurso);
    }

    consulta += ' ORDER BY c.nome, aa.nome';
    const [atividades] = await pool.query(consulta, parametros);
    res.json(atividades);
  } catch (error) {
    console.error('Erro ao listar atividades de atendimento:', error);
    res.status(500).json({ message: 'Erro ao listar atividades de atendimento' });
  }
}

export async function listarAtividadesPorCurso(req, res) {
  if (req.user?.role !== 'SUPERVISOR') {
    const idCurso = parsePositiveInt(req.params.idCurso);
    if (!idCurso || idCurso !== req.user?.idCurso) {
      return res.status(403).json({ message: 'Você não pode acessar atividades de outro curso' });
    }
  }

  req.query.idCurso = req.params.idCurso;
  return listarAtividadesAtendimento(req, res);
}

export async function obterAtividadeAtendimento(req, res) {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID da atividade inválido' });

    const atividade = await obterAtividadeComCurso(id);
    if (!atividade) return res.status(404).json({ message: 'Atividade não encontrada' });

    if (req.user?.role !== 'SUPERVISOR') {
      if (!req.user?.idCurso || atividade.idCurso !== req.user.idCurso) {
        return res.status(403).json({ message: 'Você não pode acessar atividades de outro curso' });
      }
    }

    res.json(atividade);
  } catch (error) {
    console.error('Erro ao obter atividade de atendimento:', error);
    res.status(500).json({ message: 'Erro ao obter atividade de atendimento' });
  }
}

export async function criarAtividadeAtendimento(req, res) {
  try {
    const idCursoRecebido = parsePositiveInt(req.body.idCurso);
    const idCurso = req.user?.role === 'SUPERVISOR' ? idCursoRecebido : req.user?.idCurso;
    const nome = String(req.body.nome || '').trim();
    const descricao = req.body.descricao ? String(req.body.descricao).trim() : null;

    if (!idCurso || !nome) {
      return res.status(400).json({ message: 'Curso e nome da atividade são obrigatórios' });
    }

    if (req.user?.role !== 'SUPERVISOR' && idCursoRecebido && idCursoRecebido !== req.user.idCurso) {
      return res.status(403).json({ message: 'Você não pode criar atividades em outro curso' });
    }

    const [cursos] = await pool.query('SELECT nome FROM cursos WHERE id = ? AND ativo = TRUE', [idCurso]);
    if (!cursos.length) return res.status(400).json({ message: 'Curso não encontrado ou inativo' });

    const [resultado] = await pool.query(
      'INSERT INTO atividades_atendimento (id_curso, nome, descricao, ativo) VALUES (?, ?, ?, TRUE)',
      [idCurso, nome, descricao]
    );

    await registrarMovimentacao({
      id_usuario: req.user?.id || null,
      id_curso: idCurso,
      id_atividade: resultado.insertId,
      tipo: 'Atividade cadastrada',
      descricao: `${nome} cadastrada no curso ${cursos[0].nome}`
    });

    res.status(201).json({ id: resultado.insertId, idCurso, nome, descricao, ativo: true });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Ja existe uma atividade com esse nome no curso' });
    console.error('Erro ao criar atividade de atendimento:', error);
    res.status(500).json({ message: 'Erro ao criar atividade de atendimento' });
  }
}

export async function atualizarAtividadeAtendimento(req, res) {
  try {
    const id = parsePositiveInt(req.params.id);
    const nome = String(req.body.nome || '').trim();
    const descricao = req.body.descricao ? String(req.body.descricao).trim() : null;
    const ativo = req.body.ativo !== false && req.body.ativo !== 'false';
    if (!id || !nome) return res.status(400).json({ message: 'ID e nome da atividade são obrigatórios' });

    const atividade = await obterAtividadeComCurso(id);
    if (!atividade) return res.status(404).json({ message: 'Atividade não encontrada' });

    if (req.user?.role !== 'SUPERVISOR') {
      if (!req.user?.idCurso || atividade.idCurso !== req.user.idCurso) {
        return res.status(403).json({ message: 'Você não pode alterar atividades de outro curso' });
      }
    }

    const [resultado] = await pool.query(
      'UPDATE atividades_atendimento SET nome = ?, descricao = ?, ativo = ? WHERE id = ?',
      [nome, descricao, ativo, id]
    );
    if (!resultado.affectedRows) return res.status(404).json({ message: 'Atividade não encontrada' });
    res.json({ message: 'Atividade atualizada com sucesso' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Ja existe uma atividade com esse nome no curso' });
    console.error('Erro ao atualizar atividade de atendimento:', error);
    res.status(500).json({ message: 'Erro ao atualizar atividade de atendimento' });
  }
}
