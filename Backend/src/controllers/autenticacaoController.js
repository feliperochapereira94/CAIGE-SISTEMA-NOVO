import bcrypt from "bcryptjs";
import pool from "../models/database.js";
import { getTokenTtl, signAccessToken } from "../models/tokenModel.js";

const EMAIL_DOMAIN = "@univale.br";

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Informe email e senha." });
  }

  if (!email.toLowerCase().endsWith(EMAIL_DOMAIN)) {
    return res
      .status(403)
      .json({ message: "Use o e-mail institucional @univale.br." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, senha_hash AS password_hash, nome AS name, papel AS role, id_curso AS course_id, ativo AS is_active, ultimo_login AS last_login FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const user = rows[0];

    // Rejeitar usuário inativo
    if (!user.is_active) {
      return res.status(401).json({ message: "Usuário inativo. Contate o administrador." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // Atualizar ultimo login
    const now = new Date();
    await pool.query(
      "UPDATE usuarios SET ultimo_login = ? WHERE id = ?",
      [now, user.id]
    );

    const token = signAccessToken({
      idUsuario: user.id,
      email,
      nome: user.name || email.split('@')[0],
      papel: user.role,
      idCurso: user.course_id
    });

    return res.status(200).json({ 
      message: "Login autorizado.",
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: getTokenTtl(),
      user: {
        idUsuario: user.id,
        email,
        nome: user.name || email.split('@')[0],
        papel: user.role,
        idCurso: user.course_id
      },
      nome: user.name || email.split('@')[0],
      ultimoLogin: user.last_login
    });
  } catch (error) {
    console.error("Erro ao autenticar:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.user?.email;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Informe todos os dados." });
    }

    const [rows] = await pool.query(
      "SELECT id, senha_hash AS password_hash FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "UsuÃ¡rio nÃ£o encontrado." });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Senha atual incorreta." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE usuarios SET senha_hash = ? WHERE id = ?",
      [newPasswordHash, user.id]
    );

    return res.status(200).json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

export async function confirmPassword(req, res) {
  try {
    const senha = req.body?.senha;
    if (!senha) {
      return res.status(400).json({ message: "Informe a senha do supervisor." });
    }

    if (req.user?.role !== "SUPERVISOR") {
      return res.status(403).json({ message: "Apenas supervisores podem confirmar esta operação." });
    }

    const [rows] = await pool.query(
      "SELECT senha_hash AS password_hash FROM usuarios WHERE id = ? AND papel = 'SUPERVISOR' AND ativo = TRUE LIMIT 1",
      [req.user.id]
    );
    const valida = rows.length > 0 && await bcrypt.compare(senha, rows[0].password_hash);

    if (!valida) {
      return res.status(401).json({ message: "Senha do supervisor inválida." });
    }

    return res.status(200).json({ confirmado: true });
  } catch (error) {
    console.error("Erro ao confirmar senha:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

export async function getUserProfile(req, res) {
  try {
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ message: "NÃ£o autenticado." });
    }

    const [rows] = await pool.query(
      "SELECT id, email, nome AS name, papel AS role, id_curso AS course_id, ultimo_login AS last_login FROM usuarios WHERE email = ? LIMIT 1",
      [userEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const user = rows[0];
    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name || userEmail.split('@')[0],
      role: user.role,
      idCurso: user.course_id,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

export async function updateUserProfile(req, res) {
  try {
    const userEmail = req.user?.email;
    const { name } = req.body;

    if (!userEmail) {
      return res.status(401).json({ message: "NÃ£o autenticado." });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: "Nome nÃ£o pode estar vazio." });
    }

    const [updatedRows] = await pool.query(
      "UPDATE usuarios SET nome = ? WHERE email = ?",
      [name.trim(), userEmail]
    );

    if (updatedRows.affectedRows === 0) {
      return res.status(404).json({ message: "UsuÃ¡rio nÃ£o encontrado." });
    }

    return res.status(200).json({ message: "Perfil atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

