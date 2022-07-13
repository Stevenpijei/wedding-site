export default class helpers {
    static getSinglarOrPlural(word: string, num: number): string {
        if (num >= 2) return `${word}s`;
        return word;
    }
}
