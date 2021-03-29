import * as fs from 'fs';
jest.mock('fs');

import { Release } from '../src/Release';
import { ReleaseOptions } from '../src/types';
import testChangelog from './testChangelog.md';

const parserReadMock = jest.fn();
jest.mock('../src/parsers/YamlParser', () => ({
	YamlParser: jest.fn().mockImplementation(() => {
		return {
			read: parserReadMock,
		};
	}),
}));

class MockDate extends Date {
	constructor() {
		super('2020-05-14T11:01:58.135Z');
	}
	toLocaleDateString() {
		return '3/14/2021';
	}
}

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
					merge_request: 1234,
				};
			});
		});

		it('should load changelogs and add to changelog file using template', async () => {
			const entry = new Release({ version: '1.0.0' } as ReleaseOptions);
			await entry.execute();

			expect(fs.readdirSync).toBeCalledTimes(1);
			const changelog = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
			const today = new Date();
			expect(changelog).toMatch(
				'== 1.0.0 ' + today.toLocaleDateString() + ' (2 changes)'
			);
			expect(changelog).toMatch('- test (#1234)');
			expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
			expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
			expect((fs.unlinkSync as jest.Mock).mock.calls[0][0]).toMatch(
				'1234-item.yml'
			);
			expect((fs.unlinkSync as jest.Mock).mock.calls[1][0]).toMatch(
				'2222-change.yml'
			);
		});

		it('should not call writeFileSync and unlinkSync for dry run', async () => {
			jest.spyOn(global.console, 'log').mockImplementationOnce(() => {
				// do nothing.
			});
			const entry = new Release({
				version: '1.0.0',
				dryRun: true,
			} as ReleaseOptions);
			await entry.execute();

			expect(fs.readdirSync).toBeCalledTimes(1);

			const changelog = (global.console.log as jest.Mock).mock
				.calls[0][0];
			const today = new Date();
			expect(changelog).toMatch(
				'== 1.0.0 ' + today.toLocaleDateString() + ' (2 changes)'
			);
			expect(changelog).toMatch('- test (#1234)');
			expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
			expect(fs.unlinkSync).toHaveBeenCalledTimes(0);
		});

		it('should correct add new changelog above last one', async () => {
			(fs.readFileSync as jest.Mock).mockClear();
			console.log(testChangelog);
			(fs.readFileSync as jest.Mock).mockImplementation(
				(command: string) => {
					return testChangelog;
				}
			);
			const originalDate = global.Date;
			// @ts-ignore
			global.Date = MockDate;
			const entry = new Release({
				version: '1.0.0',
			} as ReleaseOptions);
			await entry.execute();

			expect(fs.readdirSync).toBeCalledTimes(1);

			const changelog = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
			expect(changelog).toMatch('== 1.0.0 3/14/2021 (2 changes)');
			expect(changelog).toMatchSnapshot();
			expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
			expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
			global.Date = originalDate;
		});
	});
});
