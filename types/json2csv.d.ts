declare module "json2csv" {
  export interface ParserOptions<T = any> {
    fields?: Array<keyof T | string>;
    transforms?: Array<(item: T) => T>;
  }

  export class Parser<T = any> {
    constructor(options?: ParserOptions<T>);
    parse(data: T[] | Record<string, any>[]): string;
  }
}
