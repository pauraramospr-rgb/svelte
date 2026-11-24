/**
 * Ferramenta da produção, não um teste: exporta o texto de cada cena de uma aula para gravar a
 * narração (o mesmo `frases()` e a mesma impressão digital que o player usa). Fica pulada nas
 * execuções normais. Uso (ver src/lib/data/narracao/LEIAME.md):
 *
 *   EXPORTAR_NARRACAO=<aula> EXPORTAR_DESTINO=/caminho/textos.json npx vitest run src/lib/cinema/narracao-exportar.test.ts
 */
import { describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { frases } from './tempo';
import { impressao, textoParaGravar } from './gravacoes';
import { roteiroDe } from './aulas';
import { roteiroEspecial } from '$lib/especiais';

const aulaId = process.env.EXPORTAR_NARRACAO ?? '';
const destino = process.env.EXPORTAR_DESTINO ?? '';

describe.skipIf(!aulaId || !destino)('exportar a narração de uma aula', () => {
	it(`exporta ${aulaId}`, () => {
		const aula = roteiroEspecial(aulaId) ?? roteiroDe(aulaId);
		expect(aula, `aula ${aulaId} não encontrada`).toBeTruthy();
		const cenas = aula!.partes.flatMap((p) =>
			p.cenas.map((c) => ({ cena: c.id, titulo: c.titulo, texto: textoParaGravar(c.narracao), frases: frases(c.narracao), hash: impressao(c.narracao) }))
		);
		writeFileSync(destino, JSON.stringify({ aula: aulaId, cenas }, null, 1));
		expect(cenas.length).toBeGreaterThan(0);
	});
});
