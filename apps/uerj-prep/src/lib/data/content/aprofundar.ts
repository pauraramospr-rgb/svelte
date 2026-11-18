/**
 * "Para aprofundar": videoaulas de professores conhecidos e sites confiáveis, por disciplina.
 *
 * Os vídeos são indicados por BUSCA no YouTube (professor + tema do tópico), e não por links
 * fixos: a plataforma não assiste nem revisa o conteúdo dos vídeos, e uma busca sempre leva
 * às aulas mais recentes do professor sobre o assunto. Os sites listados são institucionais,
 * acadêmicos ou de referência.
 */

export interface Professor {
	nome: string;
	onde: string;
	/** Termo que identifica o professor na busca do YouTube. */
	busca: string;
	/** Página do professor ou da plataforma, quando confirmada. */
	url?: string;
}

export interface Site {
	nome: string;
	url: string;
	uso: string;
}

const ASSAAD: Professor = { nome: 'Pedro Assaad', onde: 'Plataforma Assaad (aulas gratuitas com transcrição)', busca: 'Pedro Assaad', url: 'https://plataformaassaad.com.br' };

export const PROFESSORES: Record<string, Professor[]> = {
	HIS: [
		{ nome: 'Débora Aladim', onde: 'YouTube (História)', busca: 'Débora Aladim' },
		{ nome: 'Se Liga Nessa História (Walter Solla)', onde: 'YouTube (História)', busca: 'Se Liga Nessa História' },
		ASSAAD
	],
	LPL: [{ nome: 'Professor Noslen', onde: 'YouTube (Português e Literatura)', busca: 'Professor Noslen', url: 'https://www.youtube.com/@ProfessorNoslen' }, ASSAAD],
	RED: [{ nome: 'Professor Noslen', onde: 'YouTube (Português e Redação)', busca: 'Professor Noslen', url: 'https://www.youtube.com/@ProfessorNoslen' }, ASSAAD],
	LE: [ASSAAD],
	GEO: [ASSAAD],
	BIO: [ASSAAD],
	QUI: [ASSAAD],
	FIS: [ASSAAD],
	MAT: [ASSAAD]
};

export const SITES: Record<string, Site[]> = {
	HIS: [
		{ nome: 'CPDOC/FGV', url: 'https://cpdoc.fgv.br', uso: 'Verbetes e acervos sobre a história política do Brasil republicano.' },
		{ nome: 'Memórias Reveladas (Arquivo Nacional)', url: 'https://www.gov.br/memoriasreveladas', uso: 'Documentos e notícias sobre a ditadura e a justiça de transição.' },
		{ nome: 'Encyclopaedia Britannica', url: 'https://www.britannica.com', uso: 'Verbetes de história mundial (em inglês).' },
		{ nome: 'National Archives (EUA)', url: 'https://www.archives.gov', uso: 'Documentos oficiais da história dos EUA, como a Declaração de Independência.' }
	],
	GEO: [
		{ nome: 'IBGE Educa', url: 'https://educa.ibge.gov.br', uso: 'Dados e explicações oficiais sobre população, território e cidades.' },
		{ nome: 'IBGE', url: 'https://www.ibge.gov.br', uso: 'Censos, mapas e estudos como o REGIC (rede urbana).' }
	],
	LPL: [
		{ nome: 'Academia Brasileira de Letras', url: 'https://www.academia.org.br', uso: 'Vocabulário Ortográfico (VOLP) e dúvidas de norma.' },
		{ nome: 'Vestibular UERJ – Questões Comentadas', url: 'https://www.vestibular.uerj.br', uso: 'Padrões de resposta oficiais das provas anteriores.' }
	],
	RED: [{ nome: 'Vestibular UERJ', url: 'https://www.vestibular.uerj.br', uso: 'Critérios oficiais e padrões de resposta da Redação.' }],
	LE: [{ nome: 'Vestibular UERJ – Questões Comentadas', url: 'https://www.vestibular.uerj.br', uso: 'Padrões de resposta de Espanhol, Francês e Inglês.' }],
	BIO: [{ nome: 'Khan Academy (português)', url: 'https://pt.khanacademy.org', uso: 'Aulas e exercícios de Biologia, com explicações passo a passo.' }],
	QUI: [{ nome: 'Khan Academy (português)', url: 'https://pt.khanacademy.org', uso: 'Aulas e exercícios de Química.' }],
	FIS: [{ nome: 'Khan Academy (português)', url: 'https://pt.khanacademy.org', uso: 'Aulas e exercícios de Física.' }],
	MAT: [{ nome: 'Khan Academy (português)', url: 'https://pt.khanacademy.org', uso: 'Aulas e exercícios de Matemática.' }]
};

/** Link de busca no YouTube: professor + tema. */
export function buscaYoutube(prof: Professor, tema: string): string {
	return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${prof.busca} ${tema}`);
}
