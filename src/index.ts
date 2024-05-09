#!/usr/bin/env node

const { Command } = require('commander');
import { DirectoryManager } from './directory-manager';
import { FileManager } from './file-manager';

const path = require('path');
const figlet = require('figlet');

const program = new Command();

program.name('simpledir')
  .description('A CLI tool for managing directories')
  .version('1.1.0', '-v, --version', 'output cli version')
  .usage('<command> | [option]')
  .helpOption('-h, --help', 'display help overview')
  .option('-l, --ls [directory_path]', 'list directory contents')
  .action((options: any) => {
    if (!options.ls) {
      program.outputHelp();
      return;
    }

    const lsPath = typeof options.ls === 'string' ? options.ls : process.cwd();
    DirectoryManager.listDirectoryContent(lsPath);
  })

program.showHelpAfterError('use --help for additional information');

program.command('rm')
  .alias('r')
  .usage('<name> [options]')
  .description('delete the selected file or directory')
  .summary('delete dir or file')
  .argument('<name>', 'file or directory name')
  .option('--no-recursive', 'disable recursion')
  .action((name: string, options: any) => {
    const recursive = options.recursive !== false;
    DirectoryManager.deleteFileOrDirectoryByName(path.resolve(process.cwd(), name), recursive);
  });

program.command('mk')
  .alias('m')
  .usage('<name> [options] [extension]')
  .description('create either a file or directory')
  .summary('create dir or file')
  .argument('<name>', 'file or directory name')
  .argument('[extension]', 'file extension')
  .option('-f, --file', 'create a file')
  .action(async (name: string, extension: string | undefined, options: any) => {
    const file = options.file ? true : false;

    if (file) {
      await FileManager.createFile(path.resolve(process.cwd(), name), extension);
    } else {
      await DirectoryManager.createDirectory(path.resolve(process.cwd(), name));
    }
  });

  program.command('go')
    .alias('g')
    .description('move either a file or directory')
    .summary('move dir or file')
    .argument('<name>', 'file or directory name')
    .argument('<target>', 'target relative path')
    .action(async (name: string, target: string) => {
      await DirectoryManager.moveFileOrDirectory(name, target);
    });

program.addHelpText('before', `${figlet.textSync('simpleDir')}`);
program.parse(process.argv);