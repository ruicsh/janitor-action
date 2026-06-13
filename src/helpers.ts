export function cleanListOfStrings(list: string | string[]) {
	if (typeof list === 'string') {
		return list.split(',').map((i) => i.trim()).filter(Boolean);
	}
	return list.map((i) => i.trim()).filter(Boolean);
}

export async function pMap<T, R>(
	items: T[],
	fn: (item: T) => Promise<R>,
	concurrency = 5
): Promise<R[]> {
	const results: R[] = [];
	const executing = new Set<Promise<R>>();

	for (const item of items) {
		const p = fn(item).then((r) => {
			results.push(r);
			return r;
		});
		executing.add(p);
		const clean = () => executing.delete(p);
		p.then(clean, clean);
		if (executing.size >= concurrency) {
			await Promise.race(executing);
		}
	}

	await Promise.all(executing);
	return results;
}
