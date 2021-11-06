export function paramsToObject(params: URLSearchParams) {
    const result: any = {}
    const entries = params.entries();

    for(const [key, value] of entries) {
      result[key] = value;
    }
    return result;
  }