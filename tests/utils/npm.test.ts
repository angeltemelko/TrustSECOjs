import { execSync } from 'child_process';
import { getNpmPackageVersion } from '../../src/utils/npm';

jest.mock('child_process', () => {
  return {
    execSync: jest.fn(),
  };
});

describe('getNpmPackageVersion', () => {
  it('should return the correct version', () => {
    // Arange
    const packageName = 'trustseco';
    const mockVersion = '0.1.0';
    (execSync as jest.Mock).mockReturnValue(mockVersion);
    
    // Act
    const version = getNpmPackageVersion(packageName);
    
    // Assert
    expect(version).toBe(mockVersion);
    expect(execSync).toHaveBeenCalledWith(`npm view ${packageName} version`, expect.anything());
  });

  it('should return "unknown" and log error when execSync throws', () => {
    // Arange
    const packageName = 'non-existent-package';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error('Command failed');
    });
    
    // Act
    const version = getNpmPackageVersion(packageName);
    
    // Assert
    expect(version).toBe('unknown');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`Failed to get version for package ${packageName}`), expect.anything());
    
    consoleErrorSpy.mockRestore();
  });
});
