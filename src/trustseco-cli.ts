#!/usr/bin/env node
import { Command } from 'commander';
import install from './commands/install';

const program = new Command();

program
  .version('0.1.0')
  .description('Intercept npm install to check trust score');

program.arguments('<library>').action(install);

program.parse(process.argv);
