/** Substituto de '$app/forms' (`enhance`), executando as actions no próprio navegador. */
import { submitForm, applyActionResult, type ActionResult } from '../kit.svelte';

type SubmitFn = (input: {
	formElement: HTMLFormElement;
	formData: FormData;
	action: URL;
	cancel: () => void;
	submitter: HTMLElement | null;
}) => void | ((opts: { result: ActionResult; update: () => Promise<void>; formElement: HTMLFormElement; formData: FormData; action: URL }) => void | Promise<void>);

export function enhance(form: HTMLFormElement, submit?: SubmitFn) {
	async function handler(event: SubmitEvent) {
		event.preventDefault();
		const submitter = event.submitter as HTMLButtonElement | null;
		const formData = new FormData(form, submitter ?? undefined);
		const action = new URL(submitter?.getAttribute('formaction') ?? form.getAttribute('action') ?? '', location.href.split('#')[0]);
		let cancelled = false;
		const after = submit?.({ formElement: form, formData, action, cancel: () => (cancelled = true), submitter });
		if (cancelled) return;
		const result = await submitForm(form, formData, submitter);
		const update = async () => applyActionResult(result);
		if (typeof after === 'function') await after({ result, update, formElement: form, formData, action });
		else await update();
	}
	form.addEventListener('submit', handler);
	return {
		destroy() {
			form.removeEventListener('submit', handler);
		}
	};
}

export function applyAction(result: ActionResult) {
	return applyActionResult(result);
}
