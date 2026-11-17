/** Variáveis de ambiente da versão web (sem segredos: a IA usa a conta Claude de quem vê a página). */
export const env: Record<string, string | undefined> = {
	DISCURSIVA_EMBEDDED: '1',
	ANTHROPIC_MODEL: 'Claude (conta de quem usa a página)',
	AI_DAILY_LIMIT: '400'
};
