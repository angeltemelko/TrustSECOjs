import { ParsedLibrary, hyperlink, parseLibrary } from '../../src/utils/common';

describe('hyperlink function', () => {
  it('should return the correct ANSI escape code for hyperlink', () => {
    // Arange
    const url = 'http://trustseco.com';
    const text = 'TrustSECO';
    const expected = `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;

    // Act
    const result = hyperlink(url, text);

    // Assert
    expect(result).toBe(expected);
  });
});

describe('parseLibrary function', () => {
  it('should parse the library in version and function', async () => {
    // Arrange
    const library = '@trustseco/trustseco'
    const expected: ParsedLibrary = {
      packageName: '@trustseco/trustseco'
    }

    // Act
    const result = parseLibrary(library);
    
    // Assert
    expect(result).toEqual(expected);
  });
});
