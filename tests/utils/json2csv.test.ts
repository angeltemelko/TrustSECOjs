import { jsonToCsv } from '../../src/utils/json2csv';

const customHeaderMap = {
  'Package Name': 'library',
  Version: 'version',
  'Trust Score': 'trustScore',
};

describe('jsonToCsv', () => {
  it('should return an empty string when data is an empty array', () => {
    const result = jsonToCsv([]);
    expect(result).toBe('');
  });

  it('should convert json to csv without headerMap', () => {
    const data = [
      { library: 'trustseco', version: '0.1.0', trustScore: '80' },
      { library: 'secureseco', version: '0.2.0', trustScore: '70' },
    ];
    const expectedCsv =
      'library,version,trustScore\ntrustseco,0.1.0,80\nsecureseco,0.2.0,70';
    const result = jsonToCsv(data);
    expect(result).toBe(expectedCsv);
  });

  it('should convert json to csv with headerMap', () => {
    const data = [
      { library: 'trustseco', version: '0.1.0', trustScore: '80' },
      { library: 'secureseco', version: '0.2.0', trustScore: '70' },
    ];

    const headerMap = customHeaderMap;

    const expectedCsv = 'Package Name,Version,Trust Score\ntrustseco,0.1.0,80\nsecureseco,0.2.0,70';
    const result = jsonToCsv(data, headerMap);
    expect(result).toBe(expectedCsv);
  });
});
