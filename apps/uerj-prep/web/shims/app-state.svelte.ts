/** Substituto de '$app/state' (somente `page`, que é o que as telas usam). */
export const nav = $state({
	url: new URL('https://discursiva.app/painel'),
	params: {} as Record<string, string>,
	form: null as unknown,
	status: 200
});

export const page = {
	get url() {
		return nav.url;
	},
	get params() {
		return nav.params;
	},
	get form() {
		return nav.form;
	},
	get status() {
		return nav.status;
	}
};
