import { ParsedLibrary, delay, hyperlink, parseLibrary } from '../../src/utils/common';

describe('hyperlink function', () => {
  it('should return the correct ANSI escape code for hyperlink', () => {
    const url = 'http://trustseco.com';
    const text = 'TrustSECO';

    const result = hyperlink(url, text);

    const expected = `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
    expect(result).toBe(expected);
  });
});

describe('parseLibrary function', () => {
  it('should parse the library in version and function', async () => {
    const library = '@trustseco/trustseco'

    const result = parseLibrary(library);

    const expected: ParsedLibrary = {
      packageName: '@trustseco/trustseco'
    }
    
    expect(result).toEqual(expected);
  });
});
