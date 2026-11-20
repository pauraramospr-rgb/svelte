/**
 * Série especial de História do Brasil: aulas animadas e resumos aprofundados que atravessam vários
 * tópicos do programa (Era Vargas, ditaduras, Constituições…). Cada aula fica em
 * `src/lib/data/especiais/<id>/`, com `roteiro.md` (mesma linguagem das aulas em roteiro) e
 * `resumo.md` (resumo aprofundado, com mapa mental). Categoria: interpretação pedagógica.
 */
import { parseDoc } from '$lib/content';
import { lerAula, type AulaRoteiro } from '$lib/cinema/roteiro';

const roteiros = import.meta.glob('./data/especiais/*/roteiro.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const resumos = import.meta.glob('./data/especiais/*/resumo.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export interface Especial {
	id: string;
	titulo: string;
	chamada: string;
	/** Tópicos do programa oficial que a aula aprofunda ou cruza. */
	relacionados: string[];
}

/** Ordem e apresentação da série (só aparecem as que já têm roteiro). */
export const SERIE_BRASIL: Especial[] = [
	{
		id: 'esp-era-vargas',
		titulo: 'Era Vargas e Estado Novo',
		chamada: 'Da crise da República oligárquica ao suicídio de 1954: Estado, trabalho, indústria, propaganda e repressão.',
		relacionados: [
			'his-estado-e-industrializacao-na-america-latina',
			'his-a-crise-da-sociedade-liberal',
			'his-ideologias-em-movimento-reformas-e-revolucoes',
			'his-a-guerra-em-dois-movimentos'
		]
	},
	{
		id: 'esp-ditaduras-brasileiras',
		titulo: 'Ditaduras brasileiras: Estado Novo e regime militar',
		chamada: 'As duas ditaduras do século XX comparadas, governo a governo: leis, repressão, economia, cultura, resistências e memória.',
		relacionados: ['his-as-ditaduras-na-america-latina-e-os-movimentos-de-resistenci', 'his-estado-e-industrializacao-na-america-latina', 'his-guerra-fria']
	},
	{
		id: 'esp-constituicoes-brasileiras',
		titulo: 'As Constituições do Brasil (1824–1988)',
		chamada: 'Sete Constituições e uma emenda que valeu por outra: contexto, direitos, limites, organização do poder e impactos.',
		relacionados: [
			'his-os-processos-de-formacao-dos-estados-nacionais-americanos',
			'his-o-brasil-da-monarquia-a-republica',
			'his-estado-e-industrializacao-na-america-latina',
			'his-as-ditaduras-na-america-latina-e-os-movimentos-de-resistenci'
		]
	}
];

const pasta = (p: string) => p.split('/').slice(-2, -1)[0];

function rawDe(arquivos: Record<string, string>, id: string): string | undefined {
	return Object.entries(arquivos).find(([p]) => pasta(p) === id)?.[1];
}

export interface ResumoEspecial {
	title: string;
	reviewed: string;
	references: string[];
	body: string;
}

export function roteiroEspecial(id: string): AulaRoteiro | undefined {
	const raw = rawDe(roteiros, id);
	return raw ? lerAula(id, raw) : undefined;
}

export function resumoEspecial(id: string): ResumoEspecial | undefined {
	const raw = rawDe(resumos, id);
	if (!raw) return undefined;
	const { meta, refs, body } = parseDoc(raw);
	return { title: meta.title ?? id, reviewed: meta.reviewed ?? '', references: refs, body: body.trim() };
}

export function especialDe(id: string): Especial | undefined {
	return SERIE_BRASIL.find((e) => e.id === id);
}

/** Aulas da série que já têm roteiro, na ordem da série. */
export function especiaisProntos(): Especial[] {
	return SERIE_BRASIL.filter((e) => rawDe(roteiros, e.id));
}

/** Pastas com roteiro ou resumo (para os testes conferirem que todas estão registradas). */
export function pastasEspeciais(): string[] {
	return [...new Set([...Object.keys(roteiros), ...Object.keys(resumos)].map(pasta))];
}
