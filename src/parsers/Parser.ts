export interface Data {
  [key: string]: string | boolean | number;
}

export abstract class Parser<ParserData = Data> {
  public abstract fileExtension: string;

  abstract write(data: ParserData, filepath: string): void;

  abstract read(filepath: string): ParserData;
}
