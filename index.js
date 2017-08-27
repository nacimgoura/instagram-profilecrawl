#!/usr/bin/env node

const ora = require('ora');
const chalk = require('chalk');
const meow = require('meow');
const inquirer = require('inquirer');
const api = require('./api');
const crawl = require('./crawl');

const cli = meow(`
    Usage
	  $ instagram-profilecrawl <name> <name>

	Examples
	  $ instagram-profilecrawl nacimgoura emmawatson
`);

// init spinner
const spinnerLoading = ora(chalk.blue('Init script!'));

// test if name is entered
const listProfileName = cli.input;
if (!listProfileName.length) {
    spinnerLoading.fail(chalk.red('No name entered!'));
    process.exit();
}

const prompt = {
    type: 'list',
    message: 'Choose your method for crawl.',
    name: 'typecrawl',
    choices: [
        'API Instagram (the faster)',
        'Selenium with chromedriver (more complete but less)',
    ],
};
inquirer.prompt(prompt).then((answers) => {
    if (answers.typecrawl === 'API Instagram (the faster)') {
        api.start(listProfileName);
    } else if (answers.typecrawl === 'Selenium with chromedriver (more complete but less)') {
        crawl.start(listProfileName);
    } else {
        spinnerLoading.fail(chalk.red('Choice not existing!!'));
    }
});
