import { displayPackageDetails } from '../../src/utils/table';
import { fetchTrustFactsMock } from '../../src/services/fetch-data';

jest.mock('../../src/services/fetch-data');

jest.mock('node-fetch', () => {
  return jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ data: 'someData' }) }));
});


describe('displayPackageDetails', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleTableSpy : jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleTableSpy = jest.spyOn(console, 'table').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display package details and trust facts', async () => {
    // Arrange
    const name = 'trustseco';
    const version = '1.0.0';
    const trustScore = 85;
    const trustFacts = [
      { type: 'Fact 1', value: 'Value 1' },
      { type: 'Fact 2', value: 'Value 2' },
    ];

    (fetchTrustFactsMock as jest.Mock).mockResolvedValue(trustFacts);

    // Act
    await displayPackageDetails(name, version, trustScore);

    // Assert
    expect(consoleTableSpy).toHaveBeenCalledWith([
      { Name: name, Version: version, TrustScore: `${trustScore}/100` }
    ]);
    const expectedTable: { [key: string]: any } = {};
    trustFacts.forEach(fact => {
      expectedTable[fact.type] = fact.value;
    });
    expect(consoleTableSpy).toHaveBeenCalledWith(expectedTable);
  });

  it('should display message if no trust facts are available', async () => {
    // Arrange
    const name = 'trustseco';
    const version = '0.1.0';
    const trustScore = 85;

    (fetchTrustFactsMock as jest.Mock).mockResolvedValue([]);
    
    // Act
    await displayPackageDetails(name, version, trustScore);

    // Assert
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '\nNo Trust Facts available for this package/version.'
    );
  });
});
