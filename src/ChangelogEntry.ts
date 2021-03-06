import { AssertionError } from 'assert';
import { constants, accessSync, existsSync, mkdirSync } from 'fs';
import { getBranchName, getGithubPRNumber } from './git';
import { Parser } from './parsers';
import { ChangelogData, EntryOptions } from './types';
import { Config } from './config/Config';
import { defaultConfig } from './defaultConfig';
import { getConfig } from './config';

export class ChangelogEntry {
  private config: Config;
  private parser: Parser<ChangelogData>;

  constructor(private options: EntryOptions) {}

  public async execute() {
    this.assertTitle(this.options.title);
    this.assertType(this.options.type);
    await this.initialize();
    const prNumber = await this.getPRNumber();
    const branchName = await getBranchName();

    this.assertChangelogDirectory(this.config.changelogPaths.unreleased);

    const filepath = `${this.config.changelogPaths.unreleased}/${prNumber}-${branchName}.${this.parser.fileExtension}`;

    this.assertNewFile(filepath);
    // assert_valid_type!
    // if (this.options.dry_run) {
    //   write
    //   amend_commit if options.amend
    // }
    return await this.write(filepath, prNumber);
  }

  private async initialize() {
    this.config = await getConfig(defaultConfig, this.options.config);
    const ParserClass = this.config.customParsers[this.config.parserType];
    this.parser = new ParserClass();
  }

  private async write(filepath: string, prNumber: string) {
    const data: ChangelogData = {
      title: this.options.title,
      merge_request: prNumber,
      type: this.options.type,
    };
    if (this.options.gitUsername) {
      data.author = this.options.gitUsername;
    }
    return await this.parser.write(data, filepath);
  }

  private async getPRNumber(): Promise<string> {
    if (this.options && this.options.mergeRequest) {
      return this.options.mergeRequest;
    }
    const prNumber = await getGithubPRNumber();
    if (!prNumber) {
      throw new AssertionError({
        message: 'No Pull Request created for this branch!',
      });
    }
    return prNumber;
  }

  private assertTitle(title: string): void {
    if (!title) {
      throw new AssertionError({
        message: 'Provide a title for the changelog entry.',
      });
    }
  }

  private assertType(type: string): void {
    if (!type) {
      throw new AssertionError({
        message: 'Provide a type for the changelog entry using -t or --type',
      });
    }
  }

  private assertNewFile(filepath: string) {
    if (this.options.force) {
      return;
    }
    let exists = false;
    try {
      accessSync(filepath, constants.F_OK);
      exists = true;
    } catch {
      // do nothing
    }
    if (exists) {
      throw new AssertionError({
        message: `${filepath} already exists! Use '--force' to overwrite.`,
      });
    }
  }

  private assertChangelogDirectory(changelogDirectoryPath: string) {
    if (!existsSync(changelogDirectoryPath)) {
      mkdirSync(changelogDirectoryPath, {
        recursive: true,
      });
    }
  }
}
