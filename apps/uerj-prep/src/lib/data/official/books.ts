/**
 * Livros indicados pela UERJ, por edição do Vestibular Estadual.
 * Transcrição dos anexos oficiais (Anexo 3 da 1ª fase e Anexo 5/6 da 2ª fase).
 * Em 2021–2023 o vestibular teve Exame Único (provas objetivas + Redação), sem prova
 * discursiva de Língua Portuguesa e Literaturas.
 */
import type { SourceId } from './sources';

export type BookExam = '1º Exame de Qualificação' | '2º Exame de Qualificação' | 'Língua Portuguesa e Literaturas (Exame Discursivo)' | 'Redação (Exame Discursivo)' | 'Redação (Exame Único)';

export interface IndicatedBook {
	edition: number;
	exam: BookExam;
	title: string;
	author: string;
	source: SourceId | 'prova';
	/** slug da página da biblioteca, quando existe análise completa */
	slug?: string;
}

export const CURRENT_EDITION = 2027;

export const BOOKS: IndicatedBook[] = [
	// 2027 – Anexo 3 (1ª fase 2027) e Anexo 5 (Exame Discursivo 2027)
	{ edition: 2027, exam: '1º Exame de Qualificação', title: 'Ainda estou aqui', author: 'Marcelo Rubens Paiva', source: 'anexo3-1fase-2027' },
	{ edition: 2027, exam: '2º Exame de Qualificação', title: 'O Cortiço', author: 'Aluísio Azevedo', source: 'anexo3-1fase-2027' },
	{
		edition: 2027,
		exam: 'Língua Portuguesa e Literaturas (Exame Discursivo)',
		title: 'Luanda, Lisboa, Paraíso',
		author: 'Djaimilia Pereira de Almeida',
		source: 'anexo5-2027',
		slug: 'luanda-lisboa-paraiso'
	},
	{ edition: 2027, exam: 'Redação (Exame Discursivo)', title: 'O bem-amado', author: 'Dias Gomes', source: 'anexo5-2027', slug: 'o-bem-amado' },
	// 2026
	{ edition: 2026, exam: '1º Exame de Qualificação', title: '“Amor” (conto)', author: 'Clarice Lispector', source: 'anexo3-1fase-2026' },
	{ edition: 2026, exam: '2º Exame de Qualificação', title: 'Senhora', author: 'José de Alencar', source: 'anexo3-1fase-2026' },
	{ edition: 2026, exam: 'Língua Portuguesa e Literaturas (Exame Discursivo)', title: 'O quase fim do mundo', author: 'Pepetela', source: 'anexo5-2026' },
	{ edition: 2026, exam: 'Redação (Exame Discursivo)', title: 'Hamlet', author: 'William Shakespeare', source: 'anexo5-2026' },
	// 2025
	{ edition: 2025, exam: '1º Exame de Qualificação', title: 'As mentiras que os homens contam', author: 'Luis Fernando Veríssimo', source: 'anexo3-1fase-2025' },
	{ edition: 2025, exam: '2º Exame de Qualificação', title: 'Quincas Borba', author: 'Machado de Assis', source: 'anexo3-1fase-2025' },
	{ edition: 2025, exam: 'Língua Portuguesa e Literaturas (Exame Discursivo)', title: 'Caim', author: 'José Saramago', source: 'anexo5-2025' },
	{ edition: 2025, exam: 'Redação (Exame Discursivo)', title: 'O conto da aia', author: 'Margaret Atwood', source: 'anexo5-2025' },
	// 2024
	{ edition: 2024, exam: '1º Exame de Qualificação', title: 'O meu amigo pintor', author: 'Lygia Bojunga', source: 'anexo3-1fase-2024' },
	{ edition: 2024, exam: '2º Exame de Qualificação', title: 'Anos de chumbo e outros contos', author: 'Chico Buarque', source: 'anexo3-1fase-2024' },
	{ edition: 2024, exam: 'Língua Portuguesa e Literaturas (Exame Discursivo)', title: 'Coração, cabeça e estômago', author: 'Camilo Castelo Branco', source: 'anexo5-2024' },
	{ edition: 2024, exam: 'Redação (Exame Discursivo)', title: 'O menino do pijama listrado', author: 'John Boyne', source: 'anexo5-2024' },
	// 2021–2023 (Exame Único) – livros identificados nas próprias propostas de Redação
	{ edition: 2023, exam: 'Redação (Exame Único)', title: 'Não me abandone jamais', author: 'Kazuo Ishiguro', source: 'prova' },
	{ edition: 2022, exam: 'Redação (Exame Único)', title: 'Uma janela em Copacabana', author: 'Luiz Alfredo Garcia-Roza', source: 'prova' },
	{ edition: 2021, exam: 'Redação (Exame Único)', title: '1984', author: 'George Orwell', source: 'prova' },
	// 2020 e 2019 – Anexo 6 do Exame Discursivo
	{ edition: 2020, exam: 'Língua Portuguesa e Literaturas (Exame Discursivo)', title: 'Antes de nascer o mundo', author: 'Mia Couto', source: 'anexo6-2020' },
	{ edition: 2020, exam: 'Redação (Exame Discursivo)', title: 'Vidas Secas', author: 'Graciliano Ramos', source: 'anexo6-2020' },
	{ edition: 2019, exam: 'Língua Portuguesa e Literaturas (Exame Discursivo)', title: 'O crime do padre Amaro', author: 'Eça de Queirós', source: 'anexo6-2019' },
	{ edition: 2019, exam: 'Redação (Exame Discursivo)', title: 'O seminarista', author: 'Rubem Fonseca', source: 'anexo6-2019' }
];

export const currentBooks = () => BOOKS.filter((b) => b.edition === CURRENT_EDITION);
export const previousBooks = () => BOOKS.filter((b) => b.edition !== CURRENT_EDITION);
