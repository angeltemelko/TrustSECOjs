import { readFileSync } from 'fs';
import * as path from 'path';

export function getDependenciesAndPackageJson(): {
  dependencies: { [key: string]: string };
  packageJson: any;
} {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = packageJson.dependencies || {}
  return { dependencies, packageJson };
}
