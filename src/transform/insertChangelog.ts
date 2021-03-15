import { readFileSync, writeFileSync } from 'fs';
import { TransformCallback } from 'node:stream';
import { Transform, TransformOptions } from 'stream';

// Transform sctreamer to remove first line
class RemoveFirstLine extends Transform {
	_buff = '';
	_removed = false;

	constructor(transformOptions?: TransformOptions) {
		super(transformOptions);
	}

	_transform(
		chunk: string,
		encoding: BufferEncoding,
		done: TransformCallback
	) {
		if (this._removed) {
			// if already removed
			this.push(chunk); // just push through buffer
		} else {
			// collect string into buffer
			this._buff += chunk.toString();

			// check if string has newline symbol
			if (this._buff.indexOf('\n') !== -1) {
				// push to stream skipping first line
				this.push(this._buff.slice(this._buff.indexOf('\n') + 2));
				// clear string buffer
				this._buff = '';
				// mark as removed
				this._removed = true;
			}
		}
		done();
	}
}

export function insertChangelog(
	filePath: string,
	identifier: RegExp,
	changelog: string
): boolean {
	const newIdHeader = changelog.split(/\n/).find((l) => l.match(identifier));
	const changelogLines: string[] = readFileSync(filePath, 'utf-8').split(
		/\n/
	);

	let insertLineNumber = -1;
	for (let index = 0; index < changelogLines.length; index++) {
		const line = changelogLines[index];
		if (line.match(identifier)) {
			insertLineNumber = index;
			break;
		}
	}
	if (
		newIdHeader &&
		insertLineNumber > -1 &&
		changelogLines.length > 0 &&
		changelogLines[insertLineNumber].startsWith(newIdHeader)
	) {
		// already in file.
		console.log(
			'Changelog entry "' +
				newIdHeader +
				'" already exists. Doing nothing.'
		);
		return false;
	}
	changelogLines.splice(insertLineNumber, 0, changelog);
	// console.log(changelogLines.join('\n'));
	writeFileSync(filePath, changelogLines.join('\n'));
	return true;
}
