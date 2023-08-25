#!/usr/bin/env node
import { Command } from 'commander';
import install from './commands/install';

const program = new Command();

program.version('0.1.0').description('Intercept npm install to check trust score');

program.arguments('<library>').action(install);

program.parse(process.argv);



/* import { Command } from 'commander';
import { execSync } from 'child_process';
const Table = require('cli-table3');

const program = new Command();

const THRESHOLD = 80;

program
  .version('0.1.0')
  .description('Intercept npm install to check trust score')
  .arguments('<library>')
  .action((library: string) => {
    const { name, version, trustScore } = fetchPackageDetails(library);

    displayPackageDetails(name, version, trustScore);

    if (trustScore < THRESHOLD) {
      console.warn(
        `\u001b[33mWarning: The trust score for ${library} is low ${trustScore}/100. Check ${hyperlink(
          'http://google.com',
          'TrustSECO portal'
        )} for more details.\u001b[0m`
      );
    }

    execSync(`npm install ${library}`, { stdio: 'inherit' });
  });

program.parse(process.argv);

function fetchPackageDetails(library: string): { name: string, version: string, trustScore: number } {
  const version = getNpmPackageVersion(library);

  return {
    name: library,
    version: version, // replace with actual version from API
    trustScore: (Math.random() * 100) | 0
  };
}


function getNpmPackageVersion(library: string): string {
  try {
      // Execute the command to get the latest version of the package.
      const output = execSync(`npm view ${library} version`, { encoding: 'utf8' });
      return output.trim(); // Trim is important because the output will have a newline at the end.
  } catch (err) {
      console.error(`Failed to get version for package ${library}`, err);
      return 'unknown';
  }
}

function displayPackageDetails(name: string, version: string, trustScore: number) {
  const table = new Table({
    head: ['Name', 'Version', 'Trust Score'],
    colWidths: [20, 10, 15]
  });

  table.push([name, version, `${trustScore}/100`]);
  
  console.log(table.toString());
}

function hyperlink(url: string, text: string){
  return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
}

 */