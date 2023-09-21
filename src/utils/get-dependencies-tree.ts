import { execSync } from 'child_process';

export function getDependencyTree(): any {
  const rawOutput = execSync('npm ls --json', { encoding: 'utf-8' });
  return JSON.parse(rawOutput);
}

export function extractAllDependencies(node: any, list: Set<string> = new Set()): Set<string> {
    if (node && node.dependencies) {
      for (const [name, value] of Object.entries(node.dependencies)) {
        list.add(name);
        extractAllDependencies(value, list);
      }
    }
    return list;
  }
  
