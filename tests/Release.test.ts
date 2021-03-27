import * as fs from 'fs';
jest.mock('fs');

import { Release } from '../src/Release';
import { ReleaseOptions } from '../src/types';
import { YamlParser } from '../src/parsers/YamlParser';

const parserReadMock = jest.fn();
jest.mock('../src/parsers/YamlParser', () => ({
	YamlParser: jest.fn().mockImplementation(() => {
		return {
			read: parserReadMock,
		};
	}),
}));

describe('Release', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fs.existsSync as jest.Mock).mockReturnValue(false);
		(fs.accessSync as jest.Mock).mockReturnValue(true);
	});

	describe('with no entries', () => {
		it('should do nothing and return: No changelogs available if no changelogs', async () => {
			(fs.readdirSync as jest.Mock).mockImplementation(
				(command: string) => {
					return [];
				}
			);
			jest.spyOn(global.console, 'log').mockImplementationOnce(() => {
				// do nothing.
			});
			const entry = new Release({ version: '1.0.0' } as ReleaseOptions);
			await entry.execute();

			expect(console.log).toHaveBeenCalledWith(
				'No changelogs available.'
			);
			expect(fs.readdirSync).toBeCalledTimes(1);
		});
	});

	describe('with entries', () => {
		beforeEach(() => {
			// (fs.readdirSync as jest.Mock).mockClear();
			(fs.readdirSync as jest.Mock).mockImplementation(
				(command: string) => {
					return ['1234-item.yml', '2222-change.yml'];
				}
			);
			(fs.readFileSync as jest.Mock).mockClear();
			(fs.readFileSync as jest.Mock).mockImplementation(
				(command: string) => {
					return '';
				}
			);
			parserReadMock.mockImplementation(() => {
				return {
					title: 'test',
				};
			});
		});
		it('should load changelogs and add to changelog file using template', async () => {
			const entry = new Release({ version: '1.0.0' } as ReleaseOptions);
			await entry.execute();

			expect(fs.readdirSync).toBeCalledTimes(1);
			expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
			expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
		});
	});
});
