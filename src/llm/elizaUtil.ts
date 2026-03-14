export function eliza(userPrompt:string):string {
	const defaults = [
		"Please go on.",
		"Tell me more.",
		"Can you elaborate on that?",
		"Why do you say that?",
		"Let's change focus a bit — tell me about your family."
	];

	const sanitize = (s:string) => {
		const allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' ";
		let out = '';
		for (const ch of s) out += allowed.indexOf(ch) >= 0 ? ch : ' ';
		return out.split(' ').filter(Boolean).join(' ').trim();
	};

	const after = (hay:string, needle:string) => {
		const idx = hay.indexOf(needle);
		if (idx === -1) return null;
		return hay.substring(idx + needle.length).trim();
	};

	if (!userPrompt || !userPrompt.trim()) return 'Please say something.';

	const cleaned = sanitize(userPrompt.trim());
	const lower = cleaned.toLowerCase();

	// Priority ordered simple patterns (no regex)
	let rest: string | null = null;

	rest = after(lower, "i am ");
	if (rest !== null && rest.length > 0) return `How long have you been ${rest}?`;

	rest = after(lower, "i'm ");
	if (rest !== null && rest.length > 0) return `How long have you been ${rest}?`;

	rest = after(lower, "i feel ");
	if (rest !== null && rest.length > 0) return `Tell me more about feeling ${rest}.`;

	if (lower.indexOf('because') !== -1) return 'Is that really the reason?';
	if (lower.indexOf('sorry') !== -1) return 'No need to apologize.';

	rest = after(lower, 'i think ');
	if (rest !== null && rest.length > 0) return `Do you really think ${rest}?`;

	// If the user mentions "you ..." try to reflect it back
	rest = after(lower, 'you ');
	if (rest !== null && rest.length > 0) return `What makes you think I ${rest}?`;

	if (lower.startsWith('why')) return 'Why do you ask that?';

	if (lower === 'no' || lower.indexOf(' no ') !== -1) return 'Why not?';
	if (lower === 'yes' || lower.indexOf(' yes ') !== -1) return 'You seem quite sure.';

	// Fallback: random default
	const i = Math.floor(Math.random()*defaults.length);
	return defaults[i];
}