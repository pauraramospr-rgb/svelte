/**
 * Lugares e regiões usados nos mapas das aulas (longitude, latitude aproximadas) e a projeção do mapa-múndi.
 * A projeção é a mesma de `mundo.json` (Mercator; o mundo inteiro ocupa a largura do palco).
 */
import mundo from './mundo.json';

const S = (mundo as { s: number }).s;
const TY = (mundo as { ty: number }).ty;

export function projetar(lon: number, lat: number): [number, number] {
	const x = ((lon + 180) / 360) * 1600;
	const y = TY - S * Math.log(Math.tan(Math.PI / 4 + (Math.max(-80, Math.min(80, lat)) * Math.PI) / 360));
	return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

/** Lugares citados nas aulas: [longitude, latitude]. */
export const LUGARES: Record<string, [number, number]> = {
	// Europa
	Lisboa: [-9.14, 38.72], Porto: [-8.61, 41.15], Sagres: [-8.94, 37.01], Sevilha: [-5.98, 37.39], Cádiz: [-6.29, 36.53], Palos: [-6.89, 37.23],
	Madri: [-3.7, 40.42], Granada: [-3.6, 37.18], Barcelona: [2.17, 41.39], Paris: [2.35, 48.86], Versalhes: [2.13, 48.8], Londres: [-0.13, 51.51],
	Manchester: [-2.24, 53.48], Liverpool: [-2.98, 53.41], Amsterdã: [4.9, 52.37], Antuérpia: [4.4, 51.22], Bruges: [3.22, 51.21], Bruxelas: [4.35, 50.85],
	Berlim: [13.4, 52.52], Viena: [16.37, 48.21], Roma: [12.5, 41.9], Veneza: [12.33, 45.44], Gênova: [8.93, 44.41], Florença: [11.26, 43.77],
	Milão: [9.19, 45.46], Nápoles: [14.27, 40.85], Constantinopla: [28.98, 41.01], Istambul: [28.98, 41.01], Moscou: [37.62, 55.76],
	'São Petersburgo': [30.34, 59.93], Petrogrado: [30.34, 59.93], Varsóvia: [21.01, 52.23], Praga: [14.42, 50.08], Budapeste: [19.04, 47.5], Atenas: [23.73, 37.98],
	Sarajevo: [18.41, 43.86], Munique: [11.58, 48.14], Genebra: [6.14, 46.2], Waterloo: [4.4, 50.71], Stalingrado: [44.52, 48.71], Normandia: [-0.5, 49.3],
	Auschwitz: [19.2, 50.03], Hamburgo: [9.99, 53.55], Lyon: [4.84, 45.76], Marselha: [5.37, 43.3], Wittenberg: [12.65, 51.87], Trento: [11.12, 46.07],
	Münster: [7.63, 51.96], Kiev: [30.52, 50.45], Belgrado: [20.46, 44.79], Dublin: [-6.26, 53.35], Edimburgo: [-3.19, 55.95], Estocolmo: [18.07, 59.33],
	Copenhague: [12.57, 55.68], Gdansk: [18.65, 54.35], Bonn: [7.1, 50.73], Maastricht: [5.69, 50.85], Davos: [9.84, 46.8], Haia: [4.3, 52.08],
	Toledo: [-4.02, 39.86], Aachen: [6.08, 50.78], Frankfurt: [8.68, 50.11], Turim: [7.69, 45.07], Leipzig: [12.37, 51.34], Dresden: [13.74, 51.05],
	Lepanto: [21.83, 38.39],
	// África
	Ceuta: [-5.32, 35.89], Tânger: [-5.8, 35.76], 'Cabo Bojador': [-14.5, 26.1], Arguim: [-16.5, 20.6], Elmina: [-1.35, 5.08], 'São Jorge da Mina': [-1.35, 5.08],
	'Cabo Verde': [-23.51, 14.93], Gorée: [-17.4, 14.67], Dacar: [-17.45, 14.69], 'São Tomé': [6.73, 0.34], Luanda: [13.23, -8.84], Benguela: [13.41, -12.58],
	'Mbanza Kongo': [14.24, -6.27], 'Cabo da Boa Esperança': [18.47, -34.36], 'Cidade do Cabo': [18.42, -33.92], 'Ilha de Moçambique': [40.74, -15.03],
	Maputo: [32.57, -25.97], Melinde: [40.12, -3.22], Mombaça: [39.67, -4.04], Zanzibar: [39.19, -6.17], Cairo: [31.24, 30.04], Alexandria: [29.92, 31.2],
	Suez: [32.55, 29.97], Argel: [3.06, 36.75], Túnis: [10.18, 36.81], Trípoli: [13.19, 32.89], Lagos: [3.38, 6.52], Acra: [-0.19, 5.6], Kinshasa: [15.27, -4.44],
	Léopoldville: [15.27, -4.44], Nairóbi: [36.82, -1.29], 'Adis Abeba': [38.75, 9.03], Joanesburgo: [28.05, -26.2], Pretória: [28.19, -25.75], Soweto: [27.86, -26.27],
	Sharpeville: [27.86, -26.69], Bissau: [-15.6, 11.86], Conacri: [-13.7, 9.51], Abuja: [7.49, 9.06], Timbuktu: [-3.0, 16.77], 'Grande Zimbábue': [30.93, -20.27],
	Kilwa: [39.51, -8.96], Benin: [5.63, 6.34], Ajudá: [2.08, 6.36],
	// Ásia e Oriente Médio
	Calicute: [75.78, 11.25], Goa: [73.83, 15.49], Cochim: [76.27, 9.93], Ormuz: [56.45, 27.1], Malaca: [102.25, 2.19], Macau: [113.54, 22.2], Cantão: [113.26, 23.13],
	Pequim: [116.4, 39.9], Xangai: [121.47, 31.23], Nanquim: [118.8, 32.06], 'Hong Kong': [114.17, 22.32], Nagasaki: [129.87, 32.75], Hiroshima: [132.46, 34.39],
	Tóquio: [139.69, 35.69], Seul: [126.98, 37.57], Pyongyang: [125.75, 39.03], Hanói: [105.85, 21.03], Saigon: [106.66, 10.76], 'Dien Bien Phu': [103.0, 21.39],
	'Phnom Penh': [104.92, 11.56], Jacarta: [106.85, -6.21], Manila: [120.98, 14.6], 'Nova Délhi': [77.21, 28.61], Bombaim: [72.88, 19.08], Calcutá: [88.36, 22.57],
	Karachi: [67.0, 24.86], Daca: [90.41, 23.81], Cabul: [69.21, 34.56], Teerã: [51.39, 35.69], Bagdá: [44.36, 33.31], Damasco: [36.29, 33.51], Beirute: [35.5, 33.89],
	Jerusalém: [35.21, 31.77], 'Tel Aviv': [34.78, 32.08], Gaza: [34.47, 31.5], Amã: [35.93, 31.95], Meca: [39.83, 21.42], Riad: [46.68, 24.71], Ancara: [32.86, 39.93],
	Kuwait: [47.98, 29.38], Basra: [47.78, 30.51], Ramallah: [35.2, 31.9], Cisjordânia: [35.25, 32.0], 'Colinas de Golã': [35.75, 33.0], Sinai: [33.8, 29.5],
	'Canal de Suez': [32.35, 30.5], Taiwan: [121.0, 23.7], Tibete: [91.1, 29.65],
	// Américas
	Tenochtitlan: [-99.13, 19.43], 'Cidade do México': [-99.13, 19.43], Veracruz: [-96.13, 19.18], Cusco: [-71.97, -13.53], Lima: [-77.04, -12.05], Potosí: [-65.75, -19.58],
	Cajamarca: [-78.51, -7.16], Havana: [-82.37, 23.11], 'Santo Domingo': [-69.93, 18.49], 'São Domingos': [-72.3, 19.0], 'Porto Príncipe': [-72.34, 18.54], Guanahani: [-74.5, 24.05],
	Jamestown: [-76.78, 37.21], Plymouth: [-70.67, 41.96], Boston: [-71.06, 42.36], Filadélfia: [-75.17, 39.95], 'Nova York': [-74.01, 40.71], Washington: [-77.04, 38.91],
	'Nova Orleans': [-90.07, 29.95], Chicago: [-87.63, 41.88], Detroit: [-83.05, 42.33], Gettysburg: [-77.23, 39.83], Charleston: [-79.93, 32.78], 'São Francisco': [-122.42, 37.77],
	'Los Angeles': [-118.24, 34.05], Seattle: [-122.33, 47.61], Dallas: [-96.8, 32.78], 'Pearl Harbor': [-157.97, 21.36], Panamá: [-79.52, 8.98], Caracas: [-66.9, 10.48],
	Bogotá: [-74.07, 4.71], Quito: [-78.47, -0.18], 'La Paz': [-68.15, -16.5], Santiago: [-70.67, -33.45], 'Buenos Aires': [-58.38, -34.6], Montevidéu: [-56.16, -34.9],
	Assunção: [-57.58, -25.26], Chiapas: [-92.64, 16.74], Quebec: [-71.21, 46.81], 'Bretton Woods': [-71.42, 44.26], 'Baía dos Porcos': [-81.1, 22.1], Yorktown: [-76.51, 37.24],
	Lexington: [-71.23, 42.45], 'Ouro Preto': [-43.5, -20.39], 'Vila Rica': [-43.5, -20.39], Mariana: [-43.42, -20.38], Diamantina: [-43.6, -18.24],
	Salvador: [-38.5, -12.97], 'Rio de Janeiro': [-43.17, -22.91], 'São Paulo': [-46.63, -23.55], Recife: [-34.88, -8.05], Olinda: [-34.86, -8.01],
	'Porto Seguro': [-39.06, -16.45], 'São Vicente': [-46.39, -23.96], Belém: [-48.5, -1.46], Manaus: [-60.02, -3.12], 'São Luís': [-44.3, -2.53],
	Brasília: [-47.88, -15.79], 'Porto Alegre': [-51.23, -30.03], Canudos: [-39.3, -9.9], 'Juiz de Fora': [-43.35, -21.76], Marabá: [-49.12, -5.37],
	'Serra Pelada': [-49.62, -5.95], Contestado: [-50.9, -26.9], Palmares: [-36.0, -9.15], Cuiabá: [-56.1, -15.6], Laguna: [-48.78, -28.48],
	'Vila Bela': [-59.95, -15.0], Fortaleza: [-38.54, -3.72], Natal: [-35.21, -5.79], Santos: [-46.33, -23.96], Campinas: [-47.06, -22.91], 'Volta Redonda': [-44.1, -22.52],
	Araguaia: [-48.5, -6.4], Ibiúna: [-47.22, -23.66], Carajás: [-50.3, -6.07], 'Rio Grande do Sul': [-53.0, -29.5], Pernambuco: [-37.5, -8.4], Bahia: [-41.7, -12.5],
	'Minas Gerais': [-44.5, -18.5], 'Mato Grosso': [-55.9, -12.6], Goiás: [-49.6, -16.0], Amazônia: [-62.0, -4.5], Malvinas: [-59.0, -51.7],
	'Estreito de Magalhães': [-70.9, -53.5], Mactan: [123.97, 10.3], Filipinas: [122.5, 11.5], Molucas: [127.4, 0.8], Ceilão: [80.7, 7.9], Champagne: [4.0, 48.9],
	Madeira: [-16.9, 32.7], Açores: [-27.0, 38.6], Canárias: [-15.5, 28.1], Tordesilhas: [-5.0, 41.5], Sanlúcar: [-6.35, 36.78], 'Ilha de Vera Cruz': [-39.06, -16.45],
	Guanabara: [-43.15, -22.85], Saratoga: [-73.6, 43.0], Salem: [-70.9, 42.52], Olivença: [-39.02, -14.95], 'Rio da Prata': [-57.5, -35.2], Patagônia: [-68.0, -45.0],
	// Imperialismo, guerras mundiais e século XX
	Abomé: [1.99, 7.18], Adwa: [38.9, 14.17], Bloemfontein: [26.21, -29.12], Kimberley: [24.76, -28.74], Windhoek: [17.08, -22.56], Meerut: [77.71, 28.98],
	Bandung: [107.61, -6.91], Martinica: [-61.02, 14.64], 'Ellis Island': [-74.04, 40.7], Clevelândia: [-51.87, 3.81], Verdun: [5.39, 49.16], Somme: [2.65, 50.0],
	Marne: [3.6, 48.95], Gallipoli: [26.67, 40.41], 'Alsácia-Lorena': [7.0, 48.6], 'Brest-Litovsk': [23.7, 52.1], Dunquerque: [2.38, 51.03], 'El Alamein': [28.95, 30.83],
	Kursk: [36.19, 51.73], Leningrado: [30.32, 59.94], 'Monte Castello': [10.93, 44.21], Ialta: [34.16, 44.5], Potsdam: [13.06, 52.39], Guernica: [-2.68, 43.31],
	Okinawa: [127.8, 26.3], 'Iwo Jima': [141.32, 24.78], 'Vale do Paraíba': [-45.2, -22.75], 'Oeste Paulista': [-47.9, -22.2], 'Cerro Corá': [-56.0, -22.65],
	Humaitá: [-58.5, -27.07], Corrientes: [-58.83, -27.47], Itu: [-47.3, -23.26],
	// Oceanos e mares (rótulos)
	'Oceano Atlântico': [-32, 18], 'Atlântico Sul': [-20, -20], 'Oceano Índico': [75, -18], 'Oceano Pacífico': [-140, 5], 'Mar Mediterrâneo': [18, 34.5],
	'Mar Vermelho': [38.5, 20], 'Golfo Pérsico': [51, 27], 'Mar do Caribe': [-75, 15], 'Mar do Norte': [3, 56], 'Mar Báltico': [19, 58], 'Mar Negro': [34, 43.2]
};

/** Regiões para a câmera do mapa: [lon0, lat0, lon1, lat1]. */
export const REGIOES: Record<string, [number, number, number, number]> = {
	mundo: [-168, -55, 178, 72],
	europa: [-14, 34, 45, 63],
	'europa-ocidental': [-11, 36, 20, 57],
	'peninsula-iberica': [-10.5, 35.5, 4.5, 44.2],
	mediterraneo: [-8, 29, 38, 47],
	italia: [6, 36, 19, 47.5],
	franca: [-5.5, 42, 9, 51.5],
	inglaterra: [-8, 49.5, 2.5, 56.5],
	alemanha: [5, 47, 16, 55.5],
	balcas: [13, 36, 30, 47.5],
	russia: [25, 40, 140, 72],
	atlantico: [-85, -40, 25, 52],
	'atlantico-sul': [-60, -40, 25, 15],
	africa: [-20, -36, 52, 37],
	'africa-ocidental': [-20, -2, 16, 25],
	'africa-central': [5, -18, 35, 10],
	'africa-austral': [10, -36, 42, -5],
	'africa-norte': [-15, 18, 40, 38],
	'africa-oriental': [22, -14, 52, 18],
	'europa-africa': [-20, -36, 55, 60],
	'europa-oriental': [12, 40, 45, 60],
	'frente-ocidental': [-2, 46.5, 10, 53],
	'atlantico-norte': [-100, 15, 40, 65],
	eurasia: [-12, 8, 146, 70],
	pacifico: [95, -12, 178, 50],
	asia: [40, -10, 145, 55],
	'asia-oriental': [95, 15, 146, 50],
	'sudeste-asiatico': [90, -10, 128, 25],
	india: [64, 5, 92, 33],
	china: [72, 17, 135, 54],
	japao: [127, 29, 146, 46],
	coreia: [123, 33, 132, 43.5],
	'oriente-medio': [25, 12, 62, 42],
	palestina: [33.5, 29, 36.8, 33.5],
	'rota-indias': [-22, -40, 80, 45],
	'atlantico-indico': [-52, -40, 82, 46],
	'costa-africana': [-32, 0, 12, 43],
	'africa-atlantico': [-36, -38, 45, 43],
	americas: [-125, -56, -30, 50],
	'america-norte': [-125, 15, -64, 52],
	eua: [-125, 24, -66, 50],
	'treze-colonias': [-85, 30, -66, 47],
	caribe: [-90, 8, -58, 28],
	'america-central': [-95, 6, -75, 22],
	mexico: [-118, 14, -86, 33],
	andes: [-82, -35, -60, 8],
	'america-sul': [-82, -56, -34, 13],
	brasil: [-75, -34, -33, 6],
	'cone-sul': [-76, -56, -44, -15],
	prata: [-66, -36, -46, -15],
	'nordeste-brasil': [-48, -18, -34, -1.5],
	'sudeste-brasil': [-53.5, -26, -39, -14],
	'sul-sudeste': [-55, -29.5, -38.5, -19],
	carajas: [-52.5, -8, -47.5, -4.5],
	'europa-central': [6, 43.5, 28, 56],
	'ocidente-1968': [-112, 8, 50, 60],
	'sul-brasil': [-58, -34, -47, -22],
	'norte-brasil': [-74, -12, -44, 5],
	'minas-gerais': [-51.5, -23, -39.8, -14]
};

/** Câmera que enquadra uma região no palco (com margem). */
export function cameraDaRegiao(regiao: string): { x: number; y: number; z: number } {
	const r = REGIOES[regiao] ?? REGIOES.mundo;
	const [x0, y1] = projetar(r[0], r[1]);
	const [x1, y0] = projetar(r[2], r[3]);
	const w = x1 - x0;
	const h = y1 - y0;
	const z = Math.min(40, Math.max(1, Math.min(1600 / (w * 1.08), 900 / (h * 1.08))));
	return { x: Math.round(((x0 + x1) / 2) * 10) / 10, y: Math.round(((y0 + y1) / 2) * 10) / 10, z: Math.round(z * 100) / 100 };
}

export function lugar(nome: string): [number, number] | undefined {
	const ll = LUGARES[nome];
	if (ll) return projetar(ll[0], ll[1]);
	const m = nome.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
	return m ? projetar(Number(m[1]), Number(m[2])) : undefined;
}
