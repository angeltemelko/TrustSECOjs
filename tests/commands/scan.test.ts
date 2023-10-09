import ora from 'ora';
import scan, { createReport, scanDefaultOption, scanDependenciesOption } from '../../src/commands/scan';
import { LowTrustLibrary } from '../../src/interfaces/scan-interfaces';
import { getDependenciesAndPackageJson } from '../../src/utils/dependencies';


jest.mock('ora', () => jest.fn(() => ({
  start: jest.fn(),
  stop: jest.fn(),
})));

describe('scan function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle options.dependencies correctly', async () => {

    const mockOptions = { dependencies: true, report: false };

    await scan(mockOptions);

    expect(ora).toBeCalledWith('Scan may take a while');
    expect(ora().start).toBeCalledTimes(1);
    expect(ora().stop).toBeCalledTimes(1);
    expect(scanDependenciesOption).toBeCalledTimes(1);
  });

  it('should handle options.report correctly', async () => {

    const mockOptions = { dependencies: false, report: true };
    const mockPackageJson = { dependencies: {} };
    const mockDependencies = {};
    const mockLowTrustLibraries: LowTrustLibrary[] = [
      { library: 'trustseco', version: '0.1.0', trustScore: 50 },
    ];

    (
      getDependenciesAndPackageJson as jest.MockedFunction<
        typeof getDependenciesAndPackageJson
      >
    ).mockReturnValue({
      packageJson: mockPackageJson,
      dependencies: mockDependencies,
    });

    (
      scanDefaultOption as jest.MockedFunction<typeof scanDefaultOption>
    ).mockResolvedValue(mockLowTrustLibraries);

    await scan(mockOptions);

    expect(ora).toBeCalledWith('Scan may take a while');
    expect(ora().start).toBeCalledTimes(1);
    expect(ora().stop).toBeCalledTimes(1);
    expect(getDependenciesAndPackageJson).toBeCalledTimes(1);
    expect(scanDefaultOption).toBeCalledTimes(1);
    expect(createReport).toBeCalledWith(mockLowTrustLibraries);
  });
});
