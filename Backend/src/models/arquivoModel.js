import pool from "./database.js";
import { getPatientSchema } from "./esquemaModel.js";

export async function getArchivedUsers() {
  const [rows] = await pool.query(
      `SELECT id, email, papel AS role, id_curso AS course_id, ativo AS is_active, oculto AS is_hidden,
        DATE_FORMAT(criado_em, '%d/%m/%Y %H:%i') AS created_at
       FROM usuarios
       WHERE oculto = TRUE OR ativo = FALSE
       ORDER BY criado_em DESC`
  );

  return rows;
}

export async function getArchivedPatients() {
  const { patientTable } = await getPatientSchema();
  const [rows] = await pool.query(
      `SELECT id, nome AS name, cpf, telefone AS phone, celular AS phone2, status,
        DATE_FORMAT(criado_em, '%d/%m/%Y %H:%i') AS created_at
     FROM ${patientTable}
       WHERE status = 'arquivado' AND (oculto = FALSE OR oculto IS NULL)
       ORDER BY criado_em DESC`
  );

  return rows;
}

