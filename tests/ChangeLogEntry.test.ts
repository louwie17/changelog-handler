import * as fs from 'fs';
jest.mock('fs');
const execMock = jest.fn();
jest.mock('child_process', () => ({
	exec: execMock,
}));

import { ChangelogEntry } from '../src/ChangelogEntry';
import { EntryOptions } from '../src/types/EntryOptions';

describe('ChangelogEntry', () => {
	beforeEach(() => {
		(fs.existsSync as jest.Mock).mockReturnValue(false);
		(fs.accessSync as jest.Mock).mockReturnValue(true);
		execMock.mockImplementation((command: string, callback) => {
			if (command.startsWith('git rev-parse')) {
				callback(null, { stdout: 'main ' });
			} else {
				callback(null, { stdout: '1234' });
			}
		});
	});

	it('should fail if file already exists without force=true', async () => {
		const entry = new ChangelogEntry({ title: 'test' } as EntryOptions);
		const fn = jest.fn();
		try {
			await entry.execute();
			fn();
		} catch (e) {
			expect(e.message).toEqual(
				`./changelogs/unreleased/1234-main.yml already exists! Use '--force' to overwrite.`
			);
		}
		expect(fn).toBeCalledTimes(0);
	});

	it('should continue creating a file if file already exists with force=true', async () => {
		const entry = new ChangelogEntry({
			title: 'test',
			force: true,
		} as EntryOptions);
		await entry.execute();
		expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
	});
});
