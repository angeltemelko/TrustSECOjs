import { displayPackageDetails } from '../../src/utils/table';
import { fetchTrustFactsMock } from '../../src/services/fetch-data';

jest.mock('../../src/services/fetch-data');

describe('displayPackageDetails', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
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
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Name                |Version   |Trust Score    ')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(name));
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(version)
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${trustScore}/100`)
    );
    trustFacts.forEach((fact) => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(fact.type)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(fact.value)
      );
    });
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
