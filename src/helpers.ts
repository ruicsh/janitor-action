export function cleanListOfStrings(list: string[]) {
	return list.map((i) => i.trim()).filter(Boolean);
}
