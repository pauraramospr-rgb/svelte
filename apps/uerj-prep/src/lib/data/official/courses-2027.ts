/**
 * Cursos e disciplinas específicas do Exame Discursivo 2027.
 * Transcrição do quadro do item 4.2 do Edital de Convocação (UERJ/DEPSEA, 2026).
 * Peso 2 = primeira específica; peso 1 = segunda específica; Redação = peso 1 para todos.
 * As colunas foram conferidas pela posição no PDF oficial (ex.: em Administração, Matemática
 * tem peso 2 e Língua Portuguesa e Literaturas, peso 1).
 */
import type { DisciplineCode } from './exam-2027';

export interface Course {
	id: string;
	name: string;
	campus: string;
	peso2: DisciplineCode;
	peso1: DisciplineCode;
}

type Group = { peso2: DisciplineCode; peso1: DisciplineCode; courses: string[] };

const GROUPS: Group[] = [
	{ peso2: 'MAT', peso1: 'HIS', courses: ['Ciências Econômicas (RIO)'] },
	{ peso2: 'HIS', peso1: 'MAT', courses: ['Arquitetura e Urbanismo (PETRÓPOLIS)'] },
	{ peso2: 'HIS', peso1: 'LE', courses: ['Design (RIO)', 'Relações Internacionais (RIO)'] },
	{
		peso2: 'MAT',
		peso1: 'FIS',
		courses: [
			'Ciências Atuariais (RIO)',
			'Ciência da Computação (RIO)',
			'Ciência da Computação (ZONA OESTE)',
			'Engenharia Ambiental e Sanitária (RIO)',
			'Engenharia Cartográfica e de Agrimensura (RIO)',
			'Engenharia Civil (RIO)',
			'Engenharia Computacional (RESENDE)',
			'Engenharia de Computação (NOVA FRIBURGO)',
			'Engenharia de Computação (RIO)',
			'Engenharia Eletrônica, Automática e Sistemas Inteligentes (RIO)',
			'Engenharia de Energias Renováveis (RIO)',
			'Engenharia de Materiais (ZONA OESTE)',
			'Engenharia de Produção (RESENDE)',
			'Engenharia de Produção (RIO)',
			'Engenharia de Produção (ZONA OESTE)',
			'Engenharia Elétrica (RIO)',
			'Engenharia Mecânica (NOVA FRIBURGO)',
			'Engenharia Mecânica (RESENDE)',
			'Engenharia Mecânica (RIO)',
			'Estatística (RIO)',
			'Física (RIO)',
			'Matemática (DUQUE DE CAXIAS)',
			'Matemática (RIO)',
			'Matemática (SÃO GONÇALO)',
			'Tecnologia em Construção Naval (ZONA OESTE)'
		]
	},
	{
		peso2: 'MAT',
		peso1: 'LPL',
		courses: [
			'Administração (RIO)',
			'Ciências Contábeis (RIO)',
			'Tecnologia em Análise e Desenvolvimento de Sistemas (ZONA OESTE)'
		]
	},
	{
		peso2: 'BIO',
		peso1: 'QUI',
		courses: [
			'Ciências Biológicas (RIO)',
			'Ciências Biológicas (SÃO GONÇALO)',
			'Ciências Biológicas – ênfase: Biotecnologia e Produção (ZONA OESTE)',
			'Ciências Biológicas – ênfase: Gestão Ambiental (ZONA OESTE)',
			'Educação Física (RIO)',
			'Enfermagem (RIO)',
			'Fisioterapia (RIO)',
			'Medicina (CABO FRIO)',
			'Medicina (RIO)',
			'Nutrição (RIO)',
			'Odontologia (RIO)'
		]
	},
	{
		peso2: 'HIS',
		peso1: 'GEO',
		courses: [
			'Arqueologia (RIO)',
			'Ciências Sociais (RIO)',
			'Filosofia (RIO)',
			'História (RIO)',
			'História (SÃO GONÇALO)',
			'História (DUQUE DE CAXIAS)',
			'Pedagogia (DUQUE DE CAXIAS)',
			'Pedagogia (SÃO GONÇALO)',
			'Serviço Social (RIO)'
		]
	},
	{
		peso2: 'LPL',
		peso1: 'HIS',
		courses: [
			'Artes Visuais (RIO)',
			'Direito (RIO)',
			'História da Arte (RIO)',
			'Jornalismo (RIO)',
			'Relações Públicas (RIO)'
		]
	},
	{ peso2: 'QUI', peso1: 'MAT', courses: ['Engenharia Química (RESENDE)', 'Engenharia Química (RIO)'] },
	{
		peso2: 'GEO',
		peso1: 'HIS',
		courses: [
			'Geografia (CABO FRIO)',
			'Geografia (DUQUE DE CAXIAS)',
			'Geografia (RIO)',
			'Geografia (SÃO GONÇALO)',
			'Turismo (RIO)'
		]
	},
	{ peso2: 'MAT', peso1: 'QUI', courses: ['Geologia (RIO)', 'Engenharia Metalúrgica (ZONA OESTE)'] },
	{ peso2: 'LE', peso1: 'LPL', courses: ['Letras: Inglês/Literaturas (RIO)'] },
	{
		peso2: 'LPL',
		peso1: 'LE',
		courses: [
			'Letras: Português/Alemão (RIO)',
			'Letras: Português/Espanhol (RIO)',
			'Letras: Português/Francês (RIO)',
			'Letras: Português/Grego (RIO)',
			'Letras: Português/Italiano (RIO)',
			'Letras: Português/Japonês (RIO)',
			'Letras: Português/Latim (RIO)',
			'Letras: Português/Literaturas (RIO)',
			'Letras (SÃO GONÇALO)'
		]
	},
	{ peso2: 'HIS', peso1: 'BIO', courses: ['Psicologia (RIO)'] },
	{ peso2: 'QUI', peso1: 'FIS', courses: ['Química (RIO)'] },
	{ peso2: 'HIS', peso1: 'LPL', courses: ['Pedagogia (RIO)', 'Cinema e Audiovisual (DUQUE DE CAXIAS)'] },
	{ peso2: 'QUI', peso1: 'BIO', courses: ['Farmácia (ZONA OESTE)'] },
	{ peso2: 'GEO', peso1: 'MAT', courses: ['Ciências Ambientais (CABO FRIO)'] },
	{ peso2: 'MAT', peso1: 'BIO', courses: ['Oceanografia (RIO)'] }
];

function slug(s: string): string {
	return s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

export const COURSES_2027: Course[] = GROUPS.flatMap((g) =>
	g.courses.map((full) => {
		const m = full.match(/^(.*)\s\(([^)]+)\)$/);
		const name = m ? m[1] : full;
		const campus = m ? m[2] : '';
		return { id: slug(full), name, campus, peso2: g.peso2, peso1: g.peso1 };
	})
).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.campus.localeCompare(b.campus, 'pt-BR'));

export function findCourse(id: string | null | undefined): Course | undefined {
	return id ? COURSES_2027.find((c) => c.id === id) : undefined;
}

/** Disciplinas do candidato com os pesos do edital (item 4.2). */
export function courseDisciplines(course: Course): { code: DisciplineCode; weight: 1 | 2; role: string }[] {
	return [
		{ code: course.peso2, weight: 2, role: 'Específica – peso 2' },
		{ code: course.peso1, weight: 1, role: 'Específica – peso 1' },
		{ code: 'RED', weight: 1, role: 'Geral – peso 1' }
	];
}
