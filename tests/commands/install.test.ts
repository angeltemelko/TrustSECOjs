import { fetchTrustScoreMock } from "../../src/services/fetch-data";
import { getNpmPackageVersion } from "../../src/utils/npm";
import { checkPolicies } from '../../src/utils/policy'; 
import install from '../../src/commands/install';
import { displayPackageDetails } from "../../src/utils/table";
import * as childProcess from 'child_process';
import * as readline from 'readline';

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('readline', () => ({
  createInterface: jest.fn().mockReturnValue({
    question: jest.fn((_, cb) => cb('Y')),
    close: jest.fn(),
  }),
}));

jest.mock('../../src/services/fetch-data', () => ({
  fetchTrustScoreMock: jest.fn(),
}));

jest.mock('../../src/utils/npm', () => ({
  getNpmPackageVersion: jest.fn(),
}));

jest.mock('../../src/utils/table', () => ({
  displayPackageDetails: jest.fn(),
}));

jest.mock('../../src/utils/policy', () => ({
  checkPolicies: jest.fn(),
}));

const originalLog = console.log;
const originalWarn = console.warn;

describe('install', () => {
  const packageName = 'test-package';
  const version = '1.0.0';
  const trustScore = 80;

  beforeEach(() => {
    (getNpmPackageVersion as jest.Mock).mockReturnValue(version);
    (fetchTrustScoreMock as jest.Mock).mockResolvedValue(trustScore);
    (checkPolicies as jest.Mock).mockResolvedValue(true);
    (readline.createInterface as jest.Mock).mockReturnValue({
      question: jest.fn((_, cb) => cb('Y')),
      close: jest.fn(),
    });
    console.log = jest.fn(); 
    console.warn = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.log = originalLog; 
    console.warn = originalWarn;
  });

  it('should check policies, fetch trust score, and install the package if trust score is high', async () => {
    await install(packageName);

    expect(getNpmPackageVersion).toHaveBeenCalledWith(packageName);
    expect(fetchTrustScoreMock).toHaveBeenCalledWith(packageName, version);
    expect(displayPackageDetails).toHaveBeenCalledWith(packageName, version, trustScore);
    expect(childProcess.execSync).toHaveBeenCalledWith(`npm install ${packageName}@${version}`, expect.anything());
  });

  it('should abort installation if policies are not met and user denies', async () => {
    (checkPolicies as jest.Mock).mockResolvedValue(false);
    (readline.createInterface as jest.Mock).mockReturnValue({
      question: jest.fn((_, cb) => cb('N')),
      close: jest.fn(),
    });

    await install(packageName);

    expect(childProcess.execSync).not.toHaveBeenCalled();
  });

  it('should continue installation if trust score is low but user confirms', async () => {
    (fetchTrustScoreMock as jest.Mock).mockResolvedValue(trustScore - 20); // low trust score

    await install(packageName);

    expect(childProcess.execSync).toHaveBeenCalledWith(`npm install ${packageName}@${version}`, expect.anything());
  });

  it('should abort installation if trust score is low and user denies', async () => {
    (fetchTrustScoreMock as jest.Mock).mockResolvedValue(trustScore - 20); // low trust score
    (readline.createInterface as jest.Mock).mockReturnValue({
      question: jest.fn((_, cb) => cb('N')),
      close: jest.fn(),
    });

    await install(packageName);

    expect(childProcess.execSync).not.toHaveBeenCalled();
  });
});