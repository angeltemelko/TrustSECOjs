import { exec } from 'child_process';
import {
  ApiTrustFact,
  PackageDetailsTransitiveDependencies,
  TrustFact,
  defaultPackage,
} from '../../src/interfaces/api-interfaces';
import * as fetchData from '../../src/services/fetch-data';
import fetch, { Response } from 'node-fetch';

jest.mock('child_process', () => {
  return {
    exec: jest.fn((cmd, callback) =>
      callback(null, {
        stdout: JSON.stringify({
          version: '0.1.0',
          name: 'trustseco',
          dependencies: {
            semver: '^1.0.0',
          },
        }),
      })
    ),
  };
});

jest.mock('node-fetch', () => {
  return jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(80) })
  );
});

describe('fetchTrustScore', () => {
  test('Should return number when response is ok', async () => {
    // Arrange
    const packageName = 'trustseco';
    const version = '0.1.0';
    const expected = 80;

    // Act
    const result = await fetchData.fetchTrustScore(packageName, version);

    // Assert
    expect(result).toBe(expected);
  });
  it('should throw an error when response is not ok', async () => {
    // Arange
    const packageName = 'trustseco';
    const version = '0.1.0';

    const mockedFetch = fetch as unknown as jest.MockedFunction<typeof fetch>;

    // Act
    mockedFetch.mockResolvedValueOnce(
      Promise.resolve({ ok: false, json: () => Promise.resolve() }) as any
    );

    // Assert
    await expect(
      fetchData.fetchTrustScore(packageName, version)
    ).rejects.toThrow('Failed to fetch trust score');
  });
});

describe('fetchTrustFacts', () => {
  it('Should return trust facts', async () => {
    // Aranage
    const packageName = 'trustseco';
    const version = '0.1.0';

    const mockApiTrustFacts: ApiTrustFact[] = [
      {
        jobID: 1,
        version: '1.0.0',
        fact: 'GitHub Stars',
        factData: '100',
        account: { uid: 'user1' },
      },
      {
        jobID: 2,
        version: '1.1.0',
        fact: 'Open Issues',
        factData: '5',
        account: { uid: 'user2' },
      },
      {
        jobID: 3,
        version: '1.0.1',
        fact: 'Closed Pull Requests',
        factData: '10',
        account: { uid: 'user3' },
      },
    ];

    const versionFilter = (item: ApiTrustFact) => item.version === version;

    const expectedTrustFacts = mockApiTrustFacts
      .filter(versionFilter)
      .map((item: ApiTrustFact) => parseTrustFact(item));
    const mockedFetch = fetch as unknown as jest.MockedFunction<typeof fetch>;

    // Act
    mockedFetch.mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiTrustFacts),
      }) as any
    );
    const result = await fetchData.fetchTrustFacts(packageName, version);

    // Assert
    expect(result).toEqual(expectedTrustFacts);
  });

  it('Should return empty trust facts', async () => {
    // Aranage
    const packageName = 'trustseco';
    const version = '0.1.0';

    const expectedTrustFacts = [{}];
    const mockedFetch = fetch as unknown as jest.MockedFunction<typeof fetch>;

    // Act
    mockedFetch.mockResolvedValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }) as any
    );
    const result = await fetchData.fetchTrustFacts(packageName, version);

    // Assert
    expect(result).toEqual([]);
  });

  it('should throw an error when response is not ok', async () => {
    // Aranage
    const packageName = 'trustseco';
    const version = '0.1.0';
    const mockedFetch = fetch as unknown as jest.MockedFunction<typeof fetch>;

    // Act
    mockedFetch.mockResolvedValueOnce(
      Promise.resolve({ ok: false, json: () => Promise.resolve() }) as any
    );
    // Assert
    await expect(
      fetchData.fetchTrustFacts(packageName, version)
    ).rejects.toThrow('Failed to fetch trust facts');
  });
});

describe('getTransitiveDependencies', () => {
  it('should return transitive dependencies', async () => {
    // Arrange
    const packageName = 'trustseco';
    const version = '0.1.0';

    const expectedResult = {
      version: '0.1.0',
      name: 'trustseco',
      dependencies: {
        semver: '^1.0.0',
      },
    };

    // Act
    const result = await fetchData.getTransitiveDependencies(
      packageName,
      version
    );

    // Assert
    expect(result).toEqual(expectedResult);

    expect(exec).toHaveBeenCalledWith(
      `npm view ${packageName}@${version} version name dependencies --json`,
      expect.any(Function)
    );
  });
});

const parseTrustFact = (data: ApiTrustFact): TrustFact => ({
  ...defaultPackage,
  type: data.fact,
  value: data.factData,
});
