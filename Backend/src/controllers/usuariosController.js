import bcryptjs from 'bcryptjs';
import pool from '../models/database.js';
import { registrarMovimentacao } from '../models/movimentacoesModel.js';

const EMAIL_DOMAIN = '@univale.br';

// Listar usuários (apenas supervisor)
export async function listUsers(req, res) {
  try {
    const [users] = await pool.query(
      'SELECT id, email, nome, papel, id_curso AS idCurso, criado_por AS criadoPor, ativo, criado_em AS criadoEm FROM usuarios WHERE oculto = FALSE OR oculto IS NULL ORDER BY nome'
    );
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
}

// Criar novo usuário (apenas supervisor)
export async function createUser(req, res) {
  try {
    const { email, password, nome, papel = 'PROFESSOR', idCurso } = req.body;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;

    if (!email || !password || !nome) {
      return res.status(400).json({ message: 'Email, senha e nome são obrigatórios' });
    }

    if (!String(email).toLowerCase().endsWith(EMAIL_DOMAIN)) {
      return res.status(400).json({ message: 'Use um e-mail institucional @univale.br' });
    }

    if (userRole !== 'SUPERVISOR') {
      return res.status(403).json({ message: 'Apenas supervisores podem criar usuários' });
    }

    // Validar papel
    const validPapeis = ['SUPERVISOR', 'PROFESSOR'];
    if (!validPapeis.includes(papel)) {
      return res.status(400).json({ message: 'Papel inválido' });
    }

    // Validar que professor deve ter curso
    if (papel === 'PROFESSOR' && !idCurso) {
      return res.status(400).json({ message: 'O curso é obrigatório para usuários com perfil de professor.' });
    }

    // Validar que o curso existe
    if (idCurso) {
      const [cursos] = await pool.query('SELECT id FROM cursos WHERE id = ?', [idCurso]);
      if (!cursos.length) {
        return res.status(400).json({ message: 'Curso informado não existe.' });
      }
    }

    // Buscar o usuário criador
    const [creator] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [userEmail]);
    const creatorId = creator[0]?.id;

    // Hash da senha
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Inserir novo usuário
    const [result] = await pool.query(
      'INSERT INTO usuarios (email, senha_hash, nome, papel, id_curso, criado_por, ativo) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [email, hashedPassword, nome.trim(), papel, idCurso || null, creatorId]
    );

    await registrarMovimentacao({
      id_usuario: req.user?.id || creatorId || null,
      tipo: 'Usuário criado',
      descricao: `Novo usuário criado: ${nome} (${email}) - ${papel}`
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
}

// Editar usuário (apenas supervisor)
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { email, nome, papel, idCurso, ativo, novaSenha, senhaSupervisor } = req.body;

    const [currentRows] = await pool.query(
      'SELECT email, nome, papel, id_curso AS idCurso, ativo FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );

    if (!currentRows.length) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const currentUser = currentRows[0];
    const nomeNormalizado = nome !== undefined && nome !== null ? nome.trim() : null;
    const alterouNome = nomeNormalizado !== null && nomeNormalizado !== currentUser.nome;
    const alterouSenha = typeof novaSenha === 'string' && novaSenha.length > 0;

    if (alterouSenha && novaSenha.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    if (alterouNome || alterouSenha) {
      if (!senhaSupervisor) {
        return res.status(403).json({ message: 'Confirme a senha do supervisor para concluir esta alteração.' });
      }

      const [supervisorRows] = await pool.query(
        "SELECT senha_hash AS passwordHash FROM usuarios WHERE id = ? AND papel = 'SUPERVISOR' AND ativo = TRUE LIMIT 1",
        [req.user?.id]
      );

      const senhaValida =
        supervisorRows.length > 0 &&
        await bcryptjs.compare(senhaSupervisor, supervisorRows[0].passwordHash);

      if (!senhaValida) {
        return res.status(401).json({ message: 'Senha do supervisor inválida.' });
      }
    }

    const updates = [];
    const values = [];

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (nomeNormalizado !== null) {
      updates.push('nome = ?');
      values.push(nomeNormalizado);
    }

    if (papel) {
      updates.push('papel = ?');
      values.push(papel);
    }

    if (idCurso !== undefined) {
      updates.push('id_curso = ?');
      values.push(idCurso || null);
    }

    if (ativo !== undefined) {
      updates.push('ativo = ?');
      values.push(ativo);
    }

    if (alterouSenha) {
      const novaSenhaHash = await bcryptjs.hash(novaSenha, 10);
      updates.push('senha_hash = ?');
      values.push(novaSenhaHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    values.push(id);

    await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const alteracoesSensiveis = [];
    if (alterouNome) alteracoesSensiveis.push('nome');
    if (alterouSenha) alteracoesSensiveis.push('senha');

    const activityDescription = alteracoesSensiveis.length
      ? `${req.user?.name || req.user?.email} atualizou ${alteracoesSensiveis.join(' e ')} do usuário ${currentUser.email}.`
      : `Usuário atualizado: ${nomeNormalizado || email || currentUser.email}`;

    await registrarMovimentacao({
      id_usuario: req.user?.id || null,
      tipo: 'Usuário atualizado',
      descricao: activityDescription
    });

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
}

// Desabilitar usuário de forma definitiva (sem excluir do banco)
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const [userRows] = await pool.query(
      'SELECT email FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );

    if (!userRows.length) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const deletedEmail = userRows[0].email;

    await pool.query(
      'UPDATE usuarios SET ativo = FALSE, oculto = TRUE WHERE id = ?',
      [id]
    );

    await registrarMovimentacao({
      id_usuario: req.user?.id || null,
      tipo: 'Usuário desabilitado',
      descricao: `Usuário desabilitado definitivamente: ${deletedEmail}`
    });

    res.json({ message: 'Usuário desabilitado definitivamente com sucesso' });
  } catch (error) {
    console.error('Erro ao desabilitar usuário:', error);
    res.status(500).json({ message: 'Erro ao desabilitar usuário' });
  }
}
