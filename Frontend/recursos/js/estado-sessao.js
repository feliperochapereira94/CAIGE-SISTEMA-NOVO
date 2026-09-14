// =========================================================
// CAIGE - ESTADO DE SESSÃO POR GUIA (SESSIONSTORAGE)
// =========================================================
// Utilitário global para retenção de estado de trabalho temporário
// e filtros que devem sobreviver à navegação entre páginas e ao F5
// na mesma guia do navegador, sem persistir no disco (localStorage).
//
// Regras:
// - Usa exclusivamente sessionStorage (isolado por guia).
// - Namespace padronizado: caige:v1:${identificadorUsuario}:${modulo}:${identificador}.
// - Falha segura: erros de cota ou storage indisponível não quebram a página.
// - Dados corrompidos ou JSON inválido são descartados automaticamente.
// =========================================================

class EstadoSessao {
  static VERSAO = 'v1';
  static PREFIXO = 'caige';

  /**
   * Obtém o identificador estável do usuário autenticado para isolamento de namespace.
   * Prioridade: ID numérico do usuário (JWT) -> E-mail normalizado -> 'anonimo'.
   */
  static _obterIdentificadorUsuario() {
    try {
      if (typeof UtilJWT !== 'undefined' && typeof UtilJWT.obterUsuario === 'function') {
        const usuario = UtilJWT.obterUsuario();
        if (usuario?.idUsuario) {
          return String(usuario.idUsuario);
        }
        if (usuario?.email) {
          return usuario.email.trim().toLowerCase();
        }
      }

      const emailStorage =
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('userEmail')) ||
        (typeof localStorage !== 'undefined' && localStorage.getItem('userEmail'));

      if (emailStorage) {
        return emailStorage.trim().toLowerCase();
      }
    } catch {
      // Falha segura
    }

    return 'anonimo';
  }

  /**
   * Constrói a chave padronizada e isolada por usuário.
   */
  static _construirChave(modulo, identificador) {
    const usuarioId = this._obterIdentificadorUsuario();
    const mod = String(modulo || '').trim().toLowerCase();
    const id = String(identificador || '').trim().toLowerCase();
    return `${this.PREFIXO}:${this.VERSAO}:${usuarioId}:${mod}:${id}`;
  }

  /**
   * Salva dados serializados no sessionStorage sob o namespace do usuário.
   * @param {string} modulo - Ex.: 'frequencia', 'pacientes'
   * @param {string} identificador - Ex.: 'registro', 'filtros'
   * @param {any} dados - Objeto ou valor serializável em JSON
   * @returns {boolean} true se salvo com sucesso, false em caso de erro
   */
  static salvar(modulo, identificador, dados) {
    if (!modulo || !identificador || dados === undefined) {
      return false;
    }

    try {
      const chave = this._construirChave(modulo, identificador);
      const serializado = JSON.stringify(dados);
      sessionStorage.setItem(chave, serializado);
      return true;
    } catch (erro) {
      console.warn('EstadoSessao: falha segura ao salvar no sessionStorage', erro);
      return false;
    }
  }

  /**
   * Obtém e desserializa dados do sessionStorage.
   * Em caso de dados corrompidos, descarta o registro e retorna null.
   * @param {string} modulo
   * @param {string} identificador
   * @returns {any|null}
   */
  static obter(modulo, identificador) {
    if (!modulo || !identificador) {
      return null;
    }

    try {
      const chave = this._construirChave(modulo, identificador);
      const valor = sessionStorage.getItem(chave);

      if (valor === null || valor === undefined) {
        return null;
      }

      try {
        return JSON.parse(valor);
      } catch (erroParse) {
        console.warn('EstadoSessao: dados corrompidos descartados para a chave', chave, erroParse);
        sessionStorage.removeItem(chave);
        return null;
      }
    } catch (erroStorage) {
      console.warn('EstadoSessao: falha segura ao ler do sessionStorage', erroStorage);
      return null;
    }
  }

  /**
   * Remove um identificador específico do módulo para o usuário atual.
   * @param {string} modulo
   * @param {string} identificador
   * @returns {boolean}
   */
  static remover(modulo, identificador) {
    if (!modulo || !identificador) {
      return false;
    }

    try {
      const chave = this._construirChave(modulo, identificador);
      sessionStorage.removeItem(chave);
      return true;
    } catch (erro) {
      console.warn('EstadoSessao: falha segura ao remover chave', erro);
      return false;
    }
  }

  /**
   * Remove todas as chaves de um módulo para o usuário atual.
   * @param {string} modulo
   * @returns {boolean}
   */
  static limparModulo(modulo) {
    if (!modulo) {
      return false;
    }

    try {
      const usuarioId = this._obterIdentificadorUsuario();
      const mod = String(modulo).trim().toLowerCase();
      const prefixoModulo = `${this.PREFIXO}:${this.VERSAO}:${usuarioId}:${mod}:`;

      const chavesParaRemover = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const chave = sessionStorage.key(i);
        if (chave && chave.startsWith(prefixoModulo)) {
          chavesParaRemover.push(chave);
        }
      }

      chavesParaRemover.forEach((chave) => sessionStorage.removeItem(chave));
      return true;
    } catch (erro) {
      console.warn('EstadoSessao: falha segura ao limpar módulo', erro);
      return false;
    }
  }

  /**
   * Remove todas as chaves gerenciadas pelo EstadoSessao (prefixo caige:v1:).
   * Utilizado principalmente em fluxos de logout e expiração de sessão.
   * @returns {boolean}
   */
  static limparTudo() {
    try {
      const prefixoGlobal = `${this.PREFIXO}:${this.VERSAO}:`;
      const chavesParaRemover = [];

      for (let i = 0; i < sessionStorage.length; i++) {
        const chave = sessionStorage.key(i);
        if (chave && chave.startsWith(prefixoGlobal)) {
          chavesParaRemover.push(chave);
        }
      }

      chavesParaRemover.forEach((chave) => sessionStorage.removeItem(chave));
      return true;
    } catch (erro) {
      console.warn('EstadoSessao: falha segura ao limpar tudo', erro);
      return false;
    }
  }
}

// Exportação global
if (typeof window !== 'undefined') {
  window.EstadoSessao = EstadoSessao;
}

