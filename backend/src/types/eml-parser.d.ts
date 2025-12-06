declare module 'eml-parser' {
    class EmlParser {
        constructor(buffer: Buffer);
        parseAll(): Promise<any>;
    }
    export = EmlParser;
}
