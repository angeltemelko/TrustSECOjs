#!/usr/bin/env node
import { Command } from 'commander';
import install from './commands/install';
import scan from './commands/scan';
import { viewTree } from './commands/view-tree';
import { execSync } from 'child_process';
import { info } from './commands/info';
import {
  helpTextInfo,
  helpTextInstall,
  helpTextScan,
  helpTextUninstall,
  helpTextViewTree,
  mainDescription,
} from './constants/global-constants';
import { parseLibrary } from './utils/common';

const program = new Command();

program.version('0.1.0').description(mainDescription);

program
  .command('install <library> [version]')
  .alias('i')
  .description(
    'npm install wrapper to assess the trustworthiness of a package.'
  )
  .addHelpText('after', helpTextInstall)
  .action((library) => {
    const { packageName, version } = parseLibrary(library);
    install(packageName, version);
  });

program
  .command('scan')
  .alias('s')
  .description('Scan dependencies to get their trust scores.')
  .option('-d, --dependencies', 'Include transitive dependencies in the scan.')
  .option('-r, --report', 'Export the scan results to a CSV report.')
  .addHelpText('after', helpTextScan)
  .action((options) => {
    scan(options);
  });

program
  .command('uninstall <library>')
  .alias('u')
  .description('Uninstall a specific library using npm.')
  .addHelpText('after', helpTextUninstall)
  .action((library) => {
    execSync(`npm uninstall ${library}`, { stdio: 'inherit' });
  });

program
  .command('info <library>')
  .description('Retrieve information about a specific library.')
  .addHelpText('after', helpTextInfo)
  .action((library) => {
    const { packageName, version } = parseLibrary(library);
    info(packageName, version);
  });

program
  .command('view-tree <library> [version]')
  .alias('vt')
  .description('Visualize a library’s dependencies and their trust scores.')
  .addHelpText('after', helpTextViewTree)
  .action((library) => {
    const { packageName, version } = parseLibrary(library);
    viewTree(packageName, version);
  });
  
program.parse(process.argv);
