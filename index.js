#!/usr/bin/env node

const ora = require('ora');
const chalk = require('chalk');
const meow = require('meow');
const inquirer = require('inquirer');
const api = require('./api');
const crawl = require('./crawl');

// Cli
const cli = meow(`
    Usage
	  $ instagram-profilecrawl <name> <name>

	Examples
	  $ instagram-profilecrawl nacimgoura emmawatson
`);

// Init spinner
const spinnerLoading = ora(chalk.blue('Init script!'));

// Test if name is entered
const listProfileName = cli.input;
if (listProfileName.length <= 0) {
	spinnerLoading.fail(chalk.red('No name entered!'));
	process.exit();
}

// Choose method for crawl
const prompt = {
	type: 'list',
	message: 'Choose your method for crawl.',
	name: 'typecrawl',
	choices: [
		'API Instagram (the faster)',
		'Selenium with chromedriver (more complete but slower)'
	]
};
inquirer.prompt(prompt).then(answers => {
	if (answers.typecrawl === 'API Instagram (the faster)') {
		api.start(listProfileName);
	} else if (answers.typecrawl === 'Selenium with chromedriver (more complete but slower)') {
		crawl.start(listProfileName);
	} else {
		spinnerLoading.fail(chalk.red('Choice not existing!!'));
	}
});
