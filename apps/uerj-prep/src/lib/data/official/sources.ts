/**
 * Registro de documentos oficiais usados pela plataforma.
 * Foram obtidos diretamente em www.vestibular.uerj.br ou www.revista.vestibular.uerj.br na data indicada em
 * `accessedAt` — com uma exceção declarada: os cadernos de prova do Exame Discursivo 2024–2026, reproduzidos
 * nas questões oficiais, vieram da cópia dos PDFs da UERJ publicada pelo Estratégia Vestibulares (o site da
 * UERJ não respondia na data; ver src/lib/data/official/caderno/LEIAME.md).
 */
export type SourceId =
	| 'edital-2027'
	| 'anexo1-2027'
	| 'anexo2-2027'
	| 'anexo4-2027'
	| 'anexo5-2027'
	| 'anexo3-1fase-2027'
	| 'anexo3-1fase-2026'
	| 'anexo3-1fase-2025'
	| 'anexo3-1fase-2024'
	| 'anexo5-2026'
	| 'anexo5-2025'
	| 'anexo5-2024'
	| 'anexo6-2020'
	| 'anexo6-2019'
	| 'padrao-redacao-2026'
	| 'questoes-comentadas'
	| 'revista-vestibular'
	| 'cadernos-discursivo';

export interface OfficialSource {
	id: SourceId;
	title: string;
	publisher: string;
	year: number;
	url: string;
	accessedAt: string;
}

export const ACCESSED_AT = '2026-11-17';

export const SOURCES: Record<SourceId, OfficialSource> = {
	'edital-2027': {
		id: 'edital-2027',
		title: 'Edital de Convocação para o Exame Discursivo do Vestibular Estadual 2027',
		publisher: 'UERJ / DEPSEA',
		year: 2026,
		url: 'https://www.vestibular.uerj.br/anexos/273/Manual_2fase_2027_Edital_21-09-2026.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo1-2027': {
		id: 'anexo1-2027',
		title: 'Exame Discursivo 2027 – Anexo 1: Calendário (versão de 16/11/2026)',
		publisher: 'UERJ / DEPSEA',
		year: 2026,
		url: 'https://www.vestibular.uerj.br/anexos/273/Manual_2fase_2027_Anexo_1_16-11-2026.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo2-2027': {
		id: 'anexo2-2027',
		title: 'Exame Discursivo 2027 – Anexo 2: Quadro de cursos / vagas',
		publisher: 'UERJ / DEPSEA',
		year: 2026,
		url: 'https://www.vestibular.uerj.br/anexos/273/Manual_2fase_2027_Anexo_2.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo4-2027': {
		id: 'anexo4-2027',
		title: 'Exame Discursivo 2027 – Anexo 4: Competências / habilidades',
		publisher: 'UERJ / DEPSEA',
		year: 2026,
		url: 'https://www.vestibular.uerj.br/anexos/273/Manual_2fase_2027_Anexo_4.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo5-2027': {
		id: 'anexo5-2027',
		title: 'Exame Discursivo 2027 – Anexo 5: Conteúdos Programáticos',
		publisher: 'UERJ / DEPSEA',
		year: 2026,
		url: 'https://www.vestibular.uerj.br/anexos/273/Manual_2fase_2027_Anexo_5.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo3-1fase-2027': {
		id: 'anexo3-1fase-2027',
		title: 'Exames de Qualificação 2027 – Anexo 3: Conteúdos Básicos (indicação dos livros)',
		publisher: 'UERJ / DEPSEA',
		year: 2026,
		url: 'https://www.vestibular.uerj.br/anexos/271/Manual_1fase_2027_Anexo3.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo3-1fase-2026': {
		id: 'anexo3-1fase-2026',
		title: 'Exames de Qualificação 2026 – Anexo 3: Conteúdos Básicos',
		publisher: 'UERJ / DEPSEA',
		year: 2025,
		url: 'https://www.vestibular.uerj.br/anexos/261/Manual_1fase_2026_Anexo3.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo3-1fase-2025': {
		id: 'anexo3-1fase-2025',
		title: 'Exames de Qualificação 2025 – Anexo 3: Conteúdos Básicos',
		publisher: 'UERJ / DEPSEA',
		year: 2024,
		url: 'https://www.vestibular.uerj.br/anexos/251/Manual_1fase_2025_Anexo3.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo3-1fase-2024': {
		id: 'anexo3-1fase-2024',
		title: 'Exames de Qualificação 2024 – Anexo 3: Conteúdos Básicos',
		publisher: 'UERJ / DEPSEA',
		year: 2023,
		url: 'https://www.vestibular.uerj.br/anexos/242/Manual_1fase_2024_anexo3.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo5-2026': {
		id: 'anexo5-2026',
		title: 'Exame Discursivo 2026 – Anexo 5: Conteúdos Programáticos',
		publisher: 'UERJ / DEPSEA',
		year: 2025,
		url: 'https://www.vestibular.uerj.br/anexos/263/Manual_2fase_2026_Anexo_5.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo5-2025': {
		id: 'anexo5-2025',
		title: 'Exame Discursivo 2025 – Anexo 5: Conteúdos Programáticos',
		publisher: 'UERJ / DEPSEA',
		year: 2024,
		url: 'https://www.vestibular.uerj.br/anexos/253/Manual_2fase_2025_Anexo5.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo5-2024': {
		id: 'anexo5-2024',
		title: 'Exame Discursivo 2024 – Anexo 5: Conteúdos Programáticos',
		publisher: 'UERJ / DEPSEA',
		year: 2023,
		url: 'https://www.vestibular.uerj.br/anexos/243/Manual_2fase_2024_Anexo5.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo6-2020': {
		id: 'anexo6-2020',
		title: 'Exame Discursivo 2020 – Anexo 6: Conteúdos Programáticos',
		publisher: 'UERJ / DEPSEA',
		year: 2019,
		url: 'https://www.vestibular.uerj.br/wp-content/uploads/2019/09/Manual_2fase_09_anexo6.pdf',
		accessedAt: ACCESSED_AT
	},
	'anexo6-2019': {
		id: 'anexo6-2019',
		title: 'Exame Discursivo 2019 – Anexo 6: Conteúdos Programáticos',
		publisher: 'UERJ / DEPSEA',
		year: 2018,
		url: 'https://www.vestibular.uerj.br/wp-content/uploads/2019/02/193_editais_009_Manual_2fase_2019_Anexo6.pdf',
		accessedAt: ACCESSED_AT
	},
	'padrao-redacao-2026': {
		id: 'padrao-redacao-2026',
		title: 'Exame Discursivo 2026 – Padrão de respostas da Redação',
		publisher: 'UERJ / DEPSEA',
		year: 2025,
		url: 'https://www.vestibular.uerj.br/anexos/263/padroes/Redacao.pdf',
		accessedAt: ACCESSED_AT
	},
	'questoes-comentadas': {
		id: 'questoes-comentadas',
		title: 'Revista do Vestibular UERJ – Questões Comentadas',
		publisher: 'UERJ / DEPSEA',
		year: 2026,
		url: 'https://www.revista.vestibular.uerj.br/questao/',
		accessedAt: ACCESSED_AT
	},
	'revista-vestibular': {
		id: 'revista-vestibular',
		title: 'Revista Eletrônica do Vestibular UERJ',
		publisher: 'UERJ / DEPSEA',
		year: 2026,
		url: 'https://www.revista.vestibular.uerj.br/',
		accessedAt: ACCESSED_AT
	},
	'cadernos-discursivo': {
		id: 'cadernos-discursivo',
		title: 'Cadernos de prova do Exame Discursivo 2024, 2025 e 2026 (História e Língua Portuguesa e Literaturas), reproduzidos nas questões oficiais',
		publisher: 'UERJ / DEPSEA — cópia dos PDFs publicada pelo Estratégia Vestibulares',
		year: 2025,
		url: 'https://vestibulares.estrategia.com/portal/noticias/vestibular-uerj-2026-confira-os-cadernos-de-prova-e-o-padrao-de-respostas-do-exame-discursivo/',
		accessedAt: '2026-11-25'
	}
};

/**
 * Categorias de informação exigidas pela plataforma. Todo conteúdo exibido declara a sua.
 */
export type InfoCategory = 'oficial' | 'analise' | 'pedagogica' | 'previsao' | 'ia';

export const CATEGORY_LABEL: Record<InfoCategory, string> = {
	oficial: 'Informação oficial',
	analise: 'Análise de provas anteriores',
	pedagogica: 'Interpretação pedagógica',
	previsao: 'Previsão / possibilidade',
	ia: 'Gerado por IA'
};

export const CATEGORY_HELP: Record<InfoCategory, string> = {
	oficial:
		'Transcrito ou resumido de documento publicado pela UERJ (edital, anexos, provas, padrões de resposta, questões comentadas). A fonte e o ano estão indicados.',
	analise:
		'Resultado calculado a partir de provas e classificações oficiais de anos anteriores. Mostra o que aconteceu; não garante o que será cobrado.',
	pedagogica:
		'Explicação, resumo ou orientação elaborada pela plataforma (com apoio de IA e revisão editorial). Não é posição oficial da UERJ.',
	previsao:
		'Hipótese de cobrança baseada no histórico e no programa. É uma possibilidade, nunca uma garantia.',
	ia: 'Conteúdo produzido automaticamente por modelo de inteligência artificial sob demanda. Pode conter imprecisões: confira com as fontes oficiais.'
};
