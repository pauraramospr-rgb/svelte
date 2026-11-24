/**
 * Série especial (História do Brasil e História Geral): aulas animadas e resumos aprofundados que
 * atravessam vários tópicos do programa (Era Vargas, ditaduras, Constituições, Regências, Revolução
 * Cubana, Oriente Médio…). Cada aula fica em
 * `src/lib/data/especiais/<id>/`, com `roteiro.md` (mesma linguagem das aulas em roteiro) e
 * `resumo.md` (resumo aprofundado, com mapa mental). Categoria: interpretação pedagógica.
 */
import { parseDoc } from '$lib/content';
import { lerAula, type AulaRoteiro } from '$lib/cinema/roteiro';

const roteiros = import.meta.glob('./data/especiais/*/roteiro.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const resumos = import.meta.glob('./data/especiais/*/resumo.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export type GrupoSerie = 'brasil' | 'geral';

export const GRUPOS_SERIE: Record<GrupoSerie, string> = {
	brasil: 'História do Brasil',
	geral: 'História Geral'
};

export interface Especial {
	id: string;
	grupo: GrupoSerie;
	titulo: string;
	chamada: string;
	/** Tópicos do programa oficial que a aula aprofunda ou cruza. */
	relacionados: string[];
}

/** Ordem e apresentação da série (só aparecem as que já têm roteiro). */
export const SERIE_ESPECIAL: Especial[] = [
	{
		id: 'esp-periodo-regencial',
		grupo: 'brasil',
		titulo: 'Período Regencial (1831–1840)',
		chamada: 'Nove anos sem imperador: moderados, exaltados e restauradores, o Ato Adicional, o Regresso e as revoltas que sacudiram as províncias.',
		relacionados: ['his-os-processos-de-formacao-dos-estados-nacionais-americanos', 'his-o-brasil-da-monarquia-a-republica']
	},
	{
		id: 'esp-revolucao-farroupilha',
		grupo: 'brasil',
		titulo: 'Revolução Farroupilha (1835–1845)',
		chamada: 'Dez anos de guerra no Sul: charque, impostos e autonomia, a República Rio-Grandense, os lanceiros negros, Porongos e a paz de Ponche Verde.',
		relacionados: ['his-os-processos-de-formacao-dos-estados-nacionais-americanos', 'his-o-brasil-da-monarquia-a-republica']
	},
	{
		id: 'esp-golpe-da-maioridade',
		grupo: 'brasil',
		titulo: 'O Golpe da Maioridade (1840)',
		chamada: 'Como os liberais anteciparam a maioridade de dom Pedro II para voltar ao poder, e por que o Regresso conservador venceu mesmo assim.',
		relacionados: ['his-os-processos-de-formacao-dos-estados-nacionais-americanos', 'his-o-brasil-da-monarquia-a-republica']
	},
	{
		id: 'esp-era-vargas',
		grupo: 'brasil',
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
		grupo: 'brasil',
		titulo: 'Ditaduras brasileiras: Estado Novo e regime militar',
		chamada: 'As duas ditaduras do século XX comparadas, governo a governo: leis, repressão, economia, cultura, resistências e memória.',
		relacionados: ['his-as-ditaduras-na-america-latina-e-os-movimentos-de-resistenci', 'his-estado-e-industrializacao-na-america-latina', 'his-guerra-fria']
	},
	{
		id: 'esp-constituicoes-brasileiras',
		grupo: 'brasil',
		titulo: 'As Constituições do Brasil (1824–1988)',
		chamada: 'Sete Constituições e uma emenda que valeu por outra: contexto, direitos, limites, organização do poder e impactos.',
		relacionados: [
			'his-os-processos-de-formacao-dos-estados-nacionais-americanos',
			'his-o-brasil-da-monarquia-a-republica',
			'his-estado-e-industrializacao-na-america-latina',
			'his-as-ditaduras-na-america-latina-e-os-movimentos-de-resistenci'
		]
	},
	{
		id: 'esp-eurocentrismo-e-patrimonio',
		grupo: 'geral',
		titulo: 'Eurocentrismo, pilhagem e o valor da cultura',
		chamada: 'Por que a cultura é história e identidade de um povo, como o olhar eurocêntrico justificou saques e o que está em jogo na devolução do manto tupinambá e dos tesouros do Daomé.',
		relacionados: [
			'his-os-processos-de-conquista-e-colonizacao-europeia-na-america-',
			'his-transformacoes-no-capitalismo-e-expansao-imperialista',
			'his-os-colonialismos-em-questao',
			'his-a-ilustracao-e-a-crise-do-antigo-regime'
		]
	},
	{
		id: 'esp-revolucao-cubana',
		grupo: 'geral',
		titulo: 'A Revolução Cubana',
		chamada: 'De 1898 à crise dos mísseis: a ilha tutelada pelos Estados Unidos, a guerrilha de Sierra Maestra, a virada socialista e os ecos no Brasil e na América Latina.',
		relacionados: ['his-africa-asia-e-america-latina-em-um-mundo-bipolar', 'his-guerra-fria', 'his-a-construcao-da-hegemonia-norte-americana', 'his-ideologias-em-movimento-reformas-e-revolucoes']
	},
	{
		id: 'esp-revolucao-iraniana',
		grupo: 'geral',
		titulo: 'A Revolução Iraniana (1979)',
		chamada: 'Petróleo, o golpe de 1953, o xá e o aiatolá: como uma revolução de muitas forças virou República Islâmica e mudou o Oriente Médio.',
		relacionados: ['his-oriente-medio', 'his-guerra-fria', 'his-africa-asia-e-america-latina-em-um-mundo-bipolar']
	},
	{
		id: 'esp-guerra-do-golfo',
		grupo: 'geral',
		titulo: 'A Guerra do Golfo (1990–1991)',
		chamada: 'A invasão do Kuwait, a coalizão autorizada pela ONU, a guerra transmitida ao vivo e a “nova ordem mundial” no fim da Guerra Fria.',
		relacionados: ['his-oriente-medio', 'his-a-nova-ordem-em-um-mundo-multipolar', 'his-guerra-fria']
	},
	{
		id: 'esp-primavera-arabe',
		grupo: 'geral',
		titulo: 'A Primavera Árabe',
		chamada: 'Da Tunísia à Síria: as causas das revoltas de 2010–2011, o caminho de cada país, o papel das redes, as guerras civis e os refugiados.',
		relacionados: ['his-oriente-medio', 'his-globalizacao-e-antiglobalizacao', 'his-a-nova-ordem-em-um-mundo-multipolar']
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
	return SERIE_ESPECIAL.find((e) => e.id === id);
}

/** Aulas da série que já têm roteiro, na ordem da série (opcionalmente, só de um grupo). */
export function especiaisProntos(grupo?: GrupoSerie): Especial[] {
	return SERIE_ESPECIAL.filter((e) => rawDe(roteiros, e.id) && (!grupo || e.grupo === grupo));
}

/** Pastas com roteiro ou resumo (para os testes conferirem que todas estão registradas). */
export function pastasEspeciais(): string[] {
	return [...new Set([...Object.keys(roteiros), ...Object.keys(resumos)].map(pasta))];
}
