import { Parser } from './Parser';

import * as fs from 'fs';
import YAML from 'yaml';

export class YamlParser<ParserData> extends Parser<ParserData> {
	fileExtension = 'yml';

	write(data: ParserData, filepath: string): void {
		const yamlStr = YAML.stringify(data);
		fs.writeFileSync(filepath, yamlStr, 'utf8');
	}

	read(filepath: string): ParserData {
		const file = fs.readFileSync(filepath, 'utf8');
		const data = YAML.parse(file);
		return data;
	}
}
