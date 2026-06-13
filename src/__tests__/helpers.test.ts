import { describe, it, expect } from 'vitest';
import { cleanListOfStrings, pMap } from '../helpers';

describe('helpers', () => {
	describe('cleanListOfStrings', () => {
		it('should split a comma-separated string and trim elements', () => {
			const input = '  a, b , c  ,  ';
			const result = cleanListOfStrings(input);
			expect(result).toEqual(['a', 'b', 'c']);
		});

		it('should trim elements in an array and filter out empty strings', () => {
			const input = [' a ', ' b', '', 'c '];
			const result = cleanListOfStrings(input);
			expect(result).toEqual(['a', 'b', 'c']);
		});

		it('should return an empty array for an empty string input', () => {
			expect(cleanListOfStrings('')).toEqual([]);
		});

		it('should return an empty array for an array of only whitespace strings', () => {
			expect(cleanListOfStrings(['', '  ', ''])).toEqual([]);
		});

		it('should return an empty array for an empty array', () => {
			expect(cleanListOfStrings([])).toEqual([]);
		});
	});

	describe('pMap', () => {
		it('should map items with concurrency', async () => {
			const items = [1, 2, 3, 4, 5];
			const result = await pMap(items, async (i) => i * 2, 2);
			expect(result.sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10]);
		});

		it('should handle empty items array', async () => {
			const result = await pMap([], async (i) => i, 5);
			expect(result).toEqual([]);
		});
	});
});
