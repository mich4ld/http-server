import qs from 'qs';

export function jsonParser(chunks: Buffer[]) {
    const data = chunks.toString();
    try {
        return JSON.parse(data);
    } catch (err) {
        return {}
    }
}

export function formParser(chunks: Buffer[]) {
    const data = chunks.toString();
    
    try {
        return qs.parse(data); 
    } catch (err) {
        return {}
    }
}