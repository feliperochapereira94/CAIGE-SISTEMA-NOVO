import pool from "../models/database.js";
import { getPatientSchema } from "../models/esquemaModel.js";
import { obterMovimentacoesRecentes } from "../models/movimentacoesModel.js";

export async function getDashboardData(req, res) {
  try {
    const professor = req.user?.role === "PROFESSOR";

    if (professor && !req.user?.idCurso) {
      return res.status(403).json({ message: "Usuário sem curso vinculado" });
    }

    console.log("Carregando dados do dashboard...");
    const { patientTable, questionnaireResponsePatientColumn } = await getPatientSchema();

    // ========== INDICADORES ==========

    // 1. Pacientes cadastrados ativos (de pacientes)
    const [patientRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${patientTable} WHERE status = 'ativo' AND (oculto = FALSE OR oculto IS NULL)`
    );
    const patientCount = patientRows[0]?.total || 0;
    console.log(`✓ Pacientes ativos cadastrados: ${patientCount}`);

    // 2. Frequências/Presenças de hoje (de frequencia.registrado_em)
    const [todayPresenceRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM frequencia WHERE DATE(registrado_em) = CURDATE()`
    );
    const todayPresenceCount = todayPresenceRows[0]?.total || 0;
    console.log(`✓ Frequências hoje: ${todayPresenceCount}`);

    // 3. Avaliações de hoje (de respostas_questionarios.respondido_em)
    const [todayEvaluationRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM respostas_questionarios
       WHERE DATE(respondido_em) = CURDATE()`
    );
    const todayEvaluationCount = todayEvaluationRows[0]?.total || 0;
    console.log(`✓ Avaliações hoje: ${todayEvaluationCount}`);

    // ========== MOVIMENTAÇÕES RECENTES ==========
    const movimentacoes = await obterMovimentacoesRecentes({
      limit: 10,
      offset: 0,
      id_curso: professor ? Number(req.user.idCurso) : null,
      somenteHoje: true
    });
    console.log(`✓ Movimentações de hoje carregadas: ${movimentacoes.length}`);

    const stats = [
      {
        icon: "👥",
        title: "Pacientes ativos",
        value: patientCount,
        note: "Base atual de pacientes ativos",
        delta: "Ativos",
        deltaType: "positive"
      },
      {
        icon: "✅",
        title: "Frequências hoje",
        value: todayPresenceCount,
        note: "Presenças registradas hoje",
        delta: "Hoje",
        deltaType: "positive"
      },
      {
        icon: "📝",
        title: "Avaliações hoje",
        value: todayEvaluationCount,
        note: "Questionários respondidos hoje",
        delta: "Hoje",
        deltaType: "positive"
      }
    ];

    // Formatar movimentações para exibição
    const importantEvents = movimentacoes.map((mov) => ({
      id: `movement-${mov.id}`,
      date: mov.dataFormatada,
      type: mov.tipo,
      description: mov.descricao,
      responsavel: mov.nomUsuario || "Sistema",
      sortAt: mov.criadoEm
    }));

    console.log(`Dashboard carregado com ${stats.length} indicadores e ${importantEvents.length} movimentações`);

    return res.status(200).json({
      stats,
      importantEvents,
      movements: importantEvents,
      message: "Dashboard carregado com sucesso"
    });
  } catch (err) {
    console.error("Erro ao carregar dashboard", err);
    return res.status(500).json({
      stats: [],
      importantEvents: [],
      movements: [],
      message: "Erro ao carregar dashboard"
    });
  }
}
