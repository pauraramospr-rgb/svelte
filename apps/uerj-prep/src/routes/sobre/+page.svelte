<script lang="ts">
	import { APP_NAME } from '$lib/brand';
</script>

<svelte:head><title>Sobre · {APP_NAME}</title></svelte:head>

<h1>Sobre a plataforma</h1>
<div class="card prose">
	<p>
		A <strong>{APP_NAME}</strong> é uma plataforma independente de estudos para o Exame Discursivo do Vestibular Estadual da UERJ. Ela <strong>não tem vínculo</strong>
		com a Universidade do Estado do Rio de Janeiro nem com o DEPSEA, e não representa posições oficiais da universidade.
	</p>
	<p>
		Informações oficiais (edital, anexos, provas, padrões de resposta e questões comentadas) são reproduzidas com indicação de fonte e data de acesso para fins de
		estudo. Em caso de divergência, vale sempre o documento publicado em <a href="https://www.vestibular.uerj.br" target="_blank" rel="noopener noreferrer">www.vestibular.uerj.br</a>.
	</p>
	<p>
		Conteúdos produzidos pela plataforma — resumos, análises de obras, propostas de redação, questões inéditas e correções automáticas — são identificados como
		interpretação pedagógica, previsão ou conteúdo gerado por IA. Eles ajudam a estudar, mas podem conter imprecisões; consulte também seus professores.
	</p>
	<p>Veja os detalhes em <a href="/fontes">Fontes e metodologia</a>.</p>
</div>
