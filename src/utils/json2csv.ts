export interface HeaderMap {
  [headerName: string]: string;
}

export function jsonToCsv(data: any[], headerMap?: HeaderMap): string {
  if (data.length === 0) return '';

  const header = headerMap ? Object.keys(headerMap) : Object.keys(data[0]);
  const fieldNames = headerMap
    ? Object.values(headerMap)
    : Object.keys(data[0]);

  const rows = data.map((obj) => {
    return fieldNames
      .map((fieldName) => {
        let value = obj[fieldName];
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      })
      .join(',');
  });

  return [header.join(','), ...rows].join('\n');
}

