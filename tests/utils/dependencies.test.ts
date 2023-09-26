import { readFileSync } from 'fs';
import path from 'path';
import { getDependenciesAndPackageJson } from '../../src/utils/dependencies';

jest.mock('path');
jest.mock('fs');

describe('getDependenciesAndPackageJson', () => {
  it('should return dependencies and packageJson', () => {
    // Arrange
    const mockCwd = '/mock/trustseco';
    const mockPackageJsonPath = '/mock/trustseco/package.json';
    const mockPackageJson = {
      dependencies: {
        dependencytrustseco1: '1.0.0',
        dependencytrustseco2: '2.0.0',
      },
    };

    jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
    (path.join as jest.Mock).mockReturnValue(mockPackageJsonPath);
    (readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify(mockPackageJson)
    );

    // Act
    const { dependencies, packageJson } = getDependenciesAndPackageJson();

    // Assert
    expect(dependencies).toEqual(mockPackageJson.dependencies);
    expect(packageJson).toEqual(mockPackageJson);
    expect(path.join).toHaveBeenCalledWith(mockCwd, 'package.json');
    expect(readFileSync).toHaveBeenCalledWith(mockPackageJsonPath, 'utf-8');
  });
});
