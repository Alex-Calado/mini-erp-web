export type TipoErro = 'VALIDACAO' | 'REGRA_NEGOCIO' | 'CONFLITO' | 'NAO_ENCONTRADO';

/**
 * Exceção simples para erros previstos da aplicação (Domain / Business errors).
 * Garante mensagens amigáveis em português sem vazar detalhes de infraestrutura.
 */
export class AppError extends Error {
  constructor(
    public readonly mensagem: string,
    public readonly tipo: TipoErro = 'REGRA_NEGOCIO'
  ) {
    super(mensagem);
    this.name = 'AppError';
  }
}

export type ActionResult<T = any> = {
  sucesso: boolean;
  mensagem?: string;
  erros?: Record<string, string[]>;
  tipo?: TipoErro | 'INESPERADO';
  inputs?: Record<string, any>;
  dados?: T;
};

/**
 * Converte qualquer exceção capturada em uma resposta estruturada e segura para a UI.
 */
export function tratarErroAction(error: unknown, inputs?: Record<string, any>): ActionResult {
  // 1. Erro da Aplicação / Regra de Negócio Conhecida
  if (error instanceof AppError) {
    return {
      sucesso: false,
      tipo: error.tipo,
      mensagem: error.mensagem,
      inputs,
    };
  }

  // 2. Registra o Erro Inesperado no Console do Servidor para Diagnóstico
  console.error('[ERRO INESPERADO NO SERVIDOR]:', error);

  // 3. Retorna mensagem genérica e segura para a UI (Evita vazar SQL, conexões ou dados sensíveis)
  return {
    sucesso: false,
    tipo: 'INESPERADO',
    mensagem: 'Ocorreu um erro interno ao processar a solicitação. Tente novamente mais tarde.',
    inputs,
  };
}
