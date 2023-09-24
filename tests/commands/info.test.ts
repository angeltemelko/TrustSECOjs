import { info } from '../../src/commands/info';
import { fetchTrustScoreMock } from '../../src/services/fetch-data';
import { getNpmPackageVersion } from '../../src/utils/npm';
import { displayPackageDetails } from '../../src/utils/table';

jest.mock('../../src/services/fetch-data', () => ({
  fetchTrustScoreMock: jest.fn(),
}));

jest.mock('../../src/utils/npm', () => ({
  getNpmPackageVersion: jest.fn(),
}));

jest.mock('../../src/utils/table', () => ({
  displayPackageDetails: jest.fn(),
}));

describe('info', () =>
  test('should fetch and display package details', async () => {
    // Arange
    const packageName = 'trustseco';
    const version = '0.1.0';
    const trustScore = 80;

    (getNpmPackageVersion as jest.Mock).mockReturnValueOnce(version);
    (fetchTrustScoreMock as jest.Mock).mockResolvedValueOnce(trustScore);

    // Act
    await info(packageName, version);

    // Assert
    expect(fetchTrustScoreMock).toHaveBeenCalledWith(packageName, version);
    expect(displayPackageDetails).toHaveBeenCalledWith(
      packageName,
      version,
      trustScore
    );
  }));
