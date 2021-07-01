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

	writeFileSync(filePath, changelogLines.join('\n'));
	return true;
}

function removeChangelogHeader(changelog: string, prNumbers: string[]) {
	const changelogLines = changelog.split(/\n/);
	return changelogLines
		.filter((line) => prNumbers.some((num) => line.includes(num)))
		.join('\n');
}

export function addCherrypickChangelog(
	filePath: string,
	identifier: RegExp,
	version: string,
	changelog: string,
	prNumbers: string[]
): boolean {
	const changelogLines: string[] = readFileSync(filePath, 'utf-8').split(
		/\n/
	);

	let startLineNumber = -1;
	let endLineNumber = -1;
	let foundStart = false;
	let index = 0;
	for (index = 0; index < changelogLines.length; index++) {
		const line = changelogLines[index];
		if (line.match(identifier)) {
			if (!foundStart && line.includes(version)) {
				startLineNumber = index;
				foundStart = true;
			} else if (foundStart) {
				endLineNumber = index - 1;
				break;
			}
		}
	}
	if (endLineNumber === -1) {
		endLineNumber = index;
	}
	console.log(startLineNumber);
	console.log(endLineNumber);
	let insertLineNumber = -1;
	for (index = endLineNumber; index > startLineNumber; index--) {
		const line = changelogLines[index]?.trim();
		console.log(line);
		if (line && line.length > 3) {
			insertLineNumber = index + 1;
			break;
		}
	}
	changelogLines.splice(
		insertLineNumber,
		0,
		removeChangelogHeader(changelog, prNumbers)
	);
	// console.log(changelogLines.join('\n'));
	writeFileSync(filePath, changelogLines.join('\n'));
	return true;
}
