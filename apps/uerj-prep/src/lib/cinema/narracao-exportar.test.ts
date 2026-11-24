/**
 * Ferramenta da produção, não um teste: exporta o texto de cada cena de uma aula para gravar a
 * narração (o mesmo `frases()` e a mesma impressão digital que o player usa). Fica pulada nas
 * execuções normais. Uso (ver src/lib/data/narracao/LEIAME.md):
 *
 *   EXPORTAR_NARRACAO=<aula> EXPORTAR_DESTINO=/caminho/textos.json npx vitest run src/lib/cinema/narracao-exportar.test.ts
 *   (EXPORTAR_NARRACAO=todas exporta todas as aulas num único JSON, para a voz neural gratuita.)
 */
import { describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { frases } from './tempo';
import { impressao, textoParaGravar } from './gravacoes';
import { AULAS_ROTEIRO, roteiroDe } from './aulas';
import { especiaisProntos, roteiroEspecial } from '$lib/especiais';
import type { AulaRoteiro } from './roteiro';

const aulaId = process.env.EXPORTAR_NARRACAO ?? '';
const destino = process.env.EXPORTAR_DESTINO ?? '';

function exportar(id: string, aula: AulaRoteiro) {
	const cenas = aula.partes.flatMap((p) =>
		p.cenas.map((c) => ({ parte: p.numero, cena: c.id, titulo: c.titulo, texto: textoParaGravar(c.narracao), frases: frases(c.narracao), hash: impressao(c.narracao) }))
	);
	return { aula: id, cenas };
}

describe.skipIf(!aulaId || !destino)('exportar a narração de uma aula', () => {
	it(`exporta ${aulaId}`, () => {
		if (aulaId === 'todas') {
			// Todas as aulas em roteiro (trilha de História e de LPL) e a série especial.
			const todas = [...AULAS_ROTEIRO.map((a) => exportar(a.topicId, a)), ...especiaisProntos().map((e) => exportar(e.id, roteiroEspecial(e.id)!))];
			writeFileSync(destino, JSON.stringify(todas));
			expect(todas.length).toBeGreaterThan(0);
			return;
		}
		const aula = roteiroEspecial(aulaId) ?? roteiroDe(aulaId);
		expect(aula, `aula ${aulaId} não encontrada`).toBeTruthy();
		const dados = exportar(aulaId, aula!);
		writeFileSync(destino, JSON.stringify(dados, null, 1));
		expect(dados.cenas.length).toBeGreaterThan(0);
	});
});
