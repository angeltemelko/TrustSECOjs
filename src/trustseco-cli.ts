#!/usr/bin/env node
import { Command } from 'commander';
import install from './commands/install';
import scan from './commands/scan';
import { viewTree } from './commands/view-tree';
import { execSync } from 'child_process';

const program = new Command();

program
  .version('0.1.0')
  .description('Intercept npm install to check trust score');

program
  .command('install <library> [version]')
  .description('Intercept npm install for a specific library')
  .action((library) => {
    const [packageName, version] = library.split('@');
    install(packageName, version);
  });

program
  .command('scan')
  .description('Scan all dependencies for trust scores')
  .option('-d, --dependencies', 'Scan transitive dependencies as well')
  .option('-r, --report', 'Export results to a CSV report')
  .action((options) => {
    scan(options);
  });

program
  .command('uninstall <library>')
  .description('Uninstall a specific library using npm uninstall')
  .action((library) => {
    execSync(`npm uninstall ${library}`, { stdio: 'inherit' });
  });

program
  .command('view-tree <library> [version]')
  .description('Visualize dependencies and their trust scores')
  .action((library) => {
    const [packageName, version] = library.split('@');
    viewTree(packageName, version);
  });

program.parse(process.argv);
