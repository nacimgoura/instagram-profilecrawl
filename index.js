#!/usr/bin/env node

const selenium = require('selenium-standalone');
const wdio = require('wdio');
const phantomjs = require('phantomjs-prebuilt');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const cli = require('./cli');

// init spinner
const spinner = ora('Loading Profile!').start();

// test if browser exist
const browserName = Object.keys(cli.flags)[0];
if(cli.flags && !['chrome', 'firefox', 'phantomjs'].includes(browserName)) {
	return spinner.fail(chalk.red('Invalid browser!'));
}

// test if name is entered
const nameProfile = cli.input[0];
if (!nameProfile) {
	return spinner.fail(chalk.red('No name entered!'));
}

// create browser
const options = {
	desiredCapabilities: {
		browserName: browserName
	},
};
const browser = wdio.getBrowser(options);

if(browserName === 'phantomjs') {
	phantomjs.run('--webdriver=4444').then(program => {
		initBrowser();
		program.kill();
	});
}else {
	selenium.start((err) => {
		if(err) {
			return spinner.fail(chalk.red('Unable to start selenium server!'));
		}else {
			initBrowser();
		}
	});
}

// init browser
function initBrowser() {
	wdio.run(initCrawlProfile, () => {
		browser.end();
		process.exit();
	});
}

// init crawl of profile
function initCrawlProfile() {
	browser.init();
	browser.url(`https://instagram.com/${nameProfile}`);

	spinner.text = 'Start of treatment!';

	this.dataProfile = {
		alias: getValue('h1'),
		username: getValue('h2._79dar'),
		description: getValue('._bugdy span'),
		urlImgProfile: getValue('._o0ohn img', 'attribute', 'src'),
		numberOfPosts: Number(getValue('ul._9o0bc li:first-child ._bkw5z')) || 0,
		numberFollowers: Number(getValue('ul._9o0bc li:nth-child(2) ._bkw5z')) || 0,
		numberFollowing: Number(getValue('ul._9o0bc li:nth-child(3) ._bkw5z')) || 0,
		private: browser.isVisible('h2._glq0k'),
		posts: [],
	};

	if (browser.isExisting('div.error-container')) {
		return failCrawl('This profile does not exist!');
	}

	if(this.dataProfile.private === true) {
		createFile();
	}else {
		extractUrlPostProfile();
	}
}

// catch error
function getValue(element, type = 'text', typeAttribute = '', defaultValue = '') {
	const isExisting = browser.isExisting(element);

	if (isExisting) {
		switch (type) {
			case 'text':
				return browser.getText(element);
			case 'attribute':
				return browser.getAttribute(element, typeAttribute);
			default:
				return browser.getText(element);
		}
	}
	return defaultValue;
}

// extract all url in profile
function extractUrlPostProfile() {
	let urls = getValue('._nljxa a', 'attribute', 'href', []);
	if (urls.length > 0 && this.dataProfile.numberOfPosts > 12) {
		loadButton();
		while (this.dataProfile.numberOfPosts !== urls.length) {
			browser.scroll('body', 0, 15000);
			browser.pause(1000);
			urls = getValue('._nljxa a', 'attribute', 'href', []);
		}
	}
	moveToObject(1, 1);
}

// move cursor in each post (recursive function)
function moveToObject(i, j) {

	spinner.text = `${this.dataProfile.posts.length} posts processed!`;
	if (this.dataProfile.posts.length === this.dataProfile.numberOfPosts) {
		return createFile();
	}

	try {
		const item = `._nljxa ._myci9:nth-child(${i}) a:nth-child(${j})`;
		browser.moveToObject(item);

		const post = {
			url: getValue(item, 'attribute', 'href'),
			urlImage: getValue(`${item} img`, 'attribute', 'src'),
			numberLikes: getValue(`${item} li._sjq6j span:first-child`, 'text', '', 0),
			numberComments: getValue(`${item} li._qq2if span:first-child`, 'text', '', 0),
			isVideo: browser.isVisible(`${item} ._qihym`),
		};
		const description = getValue(`${item} img`, 'attribute', 'alt');
		post.description = description.replace(/#[a-z\u00E0-\u00FC]*/g, '').trim();
		post.tags = description.split(' ').filter(n => /^#/.exec(n));
		this.dataProfile.posts.push(post);

		if (j === 3) {
			j = 1;
			i++;
		} else {
			j++;
		}

		moveToObject(i, j);
	}catch (error) {
		failCrawl(error);
	}
}

// click in load button
function loadButton() {
	const isVisible = browser.isExisting('a._8imhp');
	if (isVisible) {
		browser.click('a._8imhp');
	}
}

// create file of user profile
function createFile() {
	fs.writeFile(`profile ${this.dataProfile.alias}.json`, JSON.stringify(this.dataProfile, null, 2), 'utf-8', (err) => {
		if (err) {
			failCrawl(err.message);
		}
		spinner.succeed(chalk.green('File created with success!'));
	});
}

// display error message
function failCrawl(message) {
	return spinner.fail(chalk.red(`Error : ${message}`));
}