export function jsonParser(chunks: Buffer[]) {
    const data = chunks.toString();
    try {
        return JSON.parse(data);
    } catch (err) {
        return {}
    }
}