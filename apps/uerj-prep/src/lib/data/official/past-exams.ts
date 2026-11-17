/**
 * Provas e padrões de respostas oficiais do Exame Discursivo (links para www.vestibular.uerj.br)
 * e documentos de "Questões Comentadas" (www.revista.vestibular.uerj.br).
 * Gerado a partir das páginas oficiais "Provas e Padrões de Resposta" de cada edição.
 * 2021–2023: Exame Único (sem provas discursivas por disciplina).
 */
import type { DisciplineCode } from './exam-2027';

export interface PastExamLinks {
	prova?: string;
	padrao?: string;
	padroes?: Record<string, string>;
}

export interface PastExamEdition {
	edition: number;
	date?: string;
	commentedUrl: string;
	disciplines: Partial<Record<DisciplineCode, PastExamLinks>>;
}

export const PAST_EXAMS: PastExamEdition[] = [
	{
		"edition": 2026,
		"commentedUrl": "https://www.revista.vestibular.uerj.br/arquivos/pdf/questao/55.pdf",
		"disciplines": {
			"RED": {
				"prova": "https://www.vestibular.uerj.br/anexos/263/provas/Redacao.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/263/padroes/Redacao.pdf"
			},
			"FIS": {
				"prova": "https://www.vestibular.uerj.br/anexos/263/provas/Fisica.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/263/padroes/Fisica.pdf"
			},
			"HIS": {
				"prova": "https://www.vestibular.uerj.br/anexos/263/provas/Historia.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/263/padroes/Historia.pdf"
			},
			"BIO": {
				"padrao": "https://www.vestibular.uerj.br/anexos/263/padroes/Biologia.pdf",
				"prova": "https://www.vestibular.uerj.br/anexos/263/provas/Biologia.pdf"
			},
			"GEO": {
				"prova": "https://www.vestibular.uerj.br/anexos/263/provas/Geografia.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/263/padroes/Geografia.pdf"
			},
			"LPL": {
				"prova": "https://www.vestibular.uerj.br/anexos/263/provas/LPL.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/263/padroes/LPL.pdf"
			},
			"LE": {
				"prova": "https://www.vestibular.uerj.br/anexos/263/provas/Linguas_estrangeiras.pdf",
				"padroes": {
					"ESP": "https://www.vestibular.uerj.br/anexos/263/padroes/Espanhol.pdf",
					"FRA": "https://www.vestibular.uerj.br/anexos/263/padroes/Frances.pdf",
					"ING": "https://www.vestibular.uerj.br/anexos/263/padroes/Ingles.pdf"
				}
			},
			"MAT": {
				"prova": "https://www.vestibular.uerj.br/anexos/263/provas/Matematica.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/263/padroes/Matematica.pdf"
			},
			"QUI": {
				"prova": "https://www.vestibular.uerj.br/anexos/263/provas/Quimica.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/263/padroes/Quimica.pdf"
			}
		}
	},
	{
		"edition": 2025,
		"commentedUrl": "https://www.revista.vestibular.uerj.br/arquivos/pdf/questao/50.pdf",
		"disciplines": {
			"RED": {
				"prova": "https://www.vestibular.uerj.br/anexos/253/provas/Redacao.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/253/padroes/Redacao.pdf"
			},
			"FIS": {
				"prova": "https://www.vestibular.uerj.br/anexos/253/provas/Fisica.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/253/padroes/pr_fis.pdf"
			},
			"HIS": {
				"prova": "https://www.vestibular.uerj.br/anexos/253/provas/Historia.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/253/padroes/Historia.pdf"
			},
			"BIO": {
				"prova": "https://www.vestibular.uerj.br/anexos/253/provas/Biologia.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/253/padroes/Biologia.pdf"
			},
			"GEO": {
				"prova": "https://www.vestibular.uerj.br/anexos/253/provas/Geografia.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/253/padroes/Geografia.pdf"
			},
			"LPL": {
				"prova": "https://www.vestibular.uerj.br/anexos/253/provas/LP.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/253/padroes/LPL.pdf"
			},
			"LE": {
				"prova": "https://www.vestibular.uerj.br/anexos/253/provas/Lingua_Estrangeira.pdf",
				"padroes": {
					"ESP": "https://www.vestibular.uerj.br/anexos/253/padroes/Espanhol.pdf",
					"FRA": "https://www.vestibular.uerj.br/anexos/253/padroes/Frances.pdf",
					"ING": "https://www.vestibular.uerj.br/anexos/253/padroes/pr_ing_.pdf"
				}
			},
			"MAT": {
				"prova": "https://www.vestibular.uerj.br/anexos/253/provas/Matematica.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/253/padroes/Matematica_retificado.pdf"
			},
			"QUI": {
				"prova": "https://www.vestibular.uerj.br/anexos/253/provas/Quimica.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/253/padroes/Quimica.pdf"
			}
		}
	},
	{
		"edition": 2024,
		"commentedUrl": "https://www.revista.vestibular.uerj.br/arquivos/pdf/questao/46.pdf",
		"disciplines": {
			"RED": {
				"prova": "https://www.vestibular.uerj.br/anexos/243/prova/Redacao.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/243/prova/redacao_1.pdf"
			},
			"FIS": {
				"prova": "https://www.vestibular.uerj.br/anexos/243/prova/Fisica.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/243/prova/Fisica_1.pdf"
			},
			"HIS": {
				"prova": "https://www.vestibular.uerj.br/anexos/243/prova/Historia.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/243/prova/Historia_1_retificado.pdf"
			},
			"BIO": {
				"prova": "https://www.vestibular.uerj.br/anexos/243/prova/Biologia.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/243/prova/Biologia_1.pdf"
			},
			"GEO": {
				"prova": "https://www.vestibular.uerj.br/anexos/243/prova/Geografia.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/243/prova/Geografia_1.pdf"
			},
			"LPL": {
				"prova": "https://www.vestibular.uerj.br/anexos/243/prova/LPL.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/243/prova/LPL_1.pdf"
			},
			"LE": {
				"prova": "https://www.vestibular.uerj.br/anexos/243/prova/Estrangeiras.pdf",
				"padroes": {
					"ESP": "https://www.vestibular.uerj.br/anexos/243/prova/Espanhol.pdf",
					"FRA": "https://www.vestibular.uerj.br/anexos/243/prova/Frances.pdf",
					"ING": "https://www.vestibular.uerj.br/anexos/243/prova/Ingles.pdf"
				}
			},
			"MAT": {
				"prova": "https://www.vestibular.uerj.br/anexos/243/prova/Matematica.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/243/prova/Matematica_retificado.pdf"
			},
			"QUI": {
				"prova": "https://www.vestibular.uerj.br/anexos/243/prova/Quimica.pdf",
				"padrao": "https://www.vestibular.uerj.br/anexos/243/prova/Quimica_1.pdf"
			}
		}
	},
	{
		"edition": 2020,
		"commentedUrl": "https://www.revista.vestibular.uerj.br/arquivos/pdf/questao/37.pdf",
		"disciplines": {
			"RED": {
				"prova": "https://www.vestibular.uerj.br/2020_ED_Redacao.pdf",
				"padrao": "https://www.vestibular.uerj.br/2020_ED_PR_Redacao.pdf"
			},
			"FIS": {
				"prova": "https://www.vestibular.uerj.br/2020_ED_Fisica.pdf",
				"padrao": "https://www.vestibular.uerj.br/2020_ED_PR_Fisica.pdf"
			},
			"HIS": {
				"prova": "https://www.vestibular.uerj.br/2020_ED_Historia.pdf",
				"padrao": "https://www.vestibular.uerj.br/2020_ED_PR_Historia.pdf"
			},
			"BIO": {
				"prova": "https://www.vestibular.uerj.br/2020_ED_Biologia.pdf",
				"padrao": "https://www.vestibular.uerj.br/2020_ED_PR_Biologia.pdf"
			},
			"GEO": {
				"prova": "https://www.vestibular.uerj.br/2020_ED_Geografia.pdf",
				"padrao": "https://www.vestibular.uerj.br/2020_ED_PR_Geografia.pdf"
			},
			"LPL": {
				"prova": "https://www.vestibular.uerj.br/2020_ED_LPL.pdf",
				"padrao": "https://www.vestibular.uerj.br/2020_ED_PR_LPL.pdf"
			},
			"LE": {
				"prova": "https://www.vestibular.uerj.br/2020_ED_Lingua_Estrangeira.pdf",
				"padroes": {
					"ESP": "https://www.vestibular.uerj.br/2020_ED_PR_Espanhol.pdf",
					"FRA": "https://www.vestibular.uerj.br/2020_ED_PR_Frances.pdf",
					"ING": "https://www.vestibular.uerj.br/2020_ED_PR_Ingles.pdf"
				}
			},
			"MAT": {
				"prova": "https://www.vestibular.uerj.br/2020_ED_Matematica.pdf",
				"padrao": "https://www.vestibular.uerj.br/2020_ED_PR_Matematica.pdf"
			},
			"QUI": {
				"prova": "https://www.vestibular.uerj.br/2020_ED_Quimica.pdf",
				"padrao": "https://www.vestibular.uerj.br/2020_ED_PR_Quimica.pdf"
			}
		}
	},
	{
		"edition": 2019,
		"commentedUrl": "https://www.revista.vestibular.uerj.br/arquivos/pdf/questao/34.pdf",
		"disciplines": {
			"RED": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_Redacao.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Redacao.pdf"
			},
			"FIS": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/04/2019_ED_Fisica.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Fisica.pdf"
			},
			"HIS": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2019_ED_Historia.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Historia.pdf"
			},
			"BIO": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_Biologia.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Biologia.pdf"
			},
			"GEO": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_Geografia.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Geografia.pdf"
			},
			"LPL": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_LPL.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_LPL.pdf"
			},
			"LE": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_Lingua_Estrangeira.pdf",
				"padroes": {
					"ESP": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Espanhol.pdf",
					"FRA": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Frances.pdf",
					"ING": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Ingles.pdf"
				}
			},
			"MAT": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_Matematica.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Matematica.pdf"
			},
			"QUI": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_Quimica.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Quimica.pdf"
			}
		}
	},
	{
		"edition": 2018,
		"commentedUrl": "https://www.revista.vestibular.uerj.br/arquivos/pdf/questao/31.pdf",
		"disciplines": {
			"RED": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_Redacao.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Redacao.pdf"
			},
			"FIS": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_Fisica.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Fisica.pdf"
			},
			"HIS": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_Historia.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Historia.pdf"
			},
			"BIO": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_Biologia.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Biologia.pdf"
			},
			"GEO": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_Geografia.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Geografia.pdf"
			},
			"LPL": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_LPL.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_LPL.pdf"
			},
			"LE": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_Lingua_Estrangeira.pdf",
				"padroes": {
					"ESP": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Espanhol.pdf",
					"FRA": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Frances.pdf",
					"ING": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Ingles.pdf"
				}
			},
			"MAT": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_Matematica.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Matematica.pdf"
			},
			"QUI": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_Quimica.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Quimica.pdf"
			}
		}
	},
	{
		"edition": 2017,
		"commentedUrl": "https://www.revista.vestibular.uerj.br/arquivos/pdf/questao/28.pdf",
		"disciplines": {
			"RED": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_LPI_Redacao.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_LPI_Redacao.pdf"
			},
			"FIS": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_Fisica.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_Fisica.pdf"
			},
			"HIS": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_Historia.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_Historia.pdf"
			},
			"BIO": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_Biologia.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_Biologia.pdf"
			},
			"GEO": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_Geografia.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_Geografia.pdf"
			},
			"LPL": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_LP_LB.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_LP_LB.pdf"
			},
			"LE": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_Lingua_Estrangeira.pdf",
				"padroes": {
					"ESP": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_Espanhol.pdf",
					"FRA": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_Frances.pdf",
					"ING": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_Ingles.pdf"
				}
			},
			"MAT": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_Matematica.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_Matematica.pdf"
			},
			"QUI": {
				"prova": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_Quimica.pdf",
				"padrao": "https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_Quimica.pdf"
			}
		}
	}
];
