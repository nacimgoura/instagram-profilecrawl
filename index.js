#!/usr/bin/env node

const fs = require('fs');
const wdio = require('wdio');
const selenium = require('selenium-standalone');
const phantomjs = require('phantomjs-prebuilt');
const ora = require('ora');
const chalk = require('chalk');
const _ = require('lodash');
const cli = require('./cli');

// init spinner
const spinnerLoading = ora('Init script!').start();
const spinnerCrawl = ora('Begin of treatment!');

// test if browser exist
const browserName = Object.keys(cli.flags)[0];
if (cli.flags && !_.includes(['chrome', 'firefox', 'phantomjs', 'ie', 'edge', 'safari', 'opera'], browserName)) {
	return spinnerLoading.fail(chalk.red('Invalid browser!'));
}

// test if name is entered
const listProfileName = cli.input;
if (listProfileName.length === 0) {
	return spinnerLoading.fail(chalk.red('No name entered!'));
}

// create browser
const options = {
	desiredCapabilities: {
		browserName,
	},
};
const browser = wdio.getBrowser(options);

if (browserName === 'phantomjs') {
	phantomjs.run('--webdriver=4444').then(program => initBrowser(program));
} else {
	selenium.start((err) => {
		if (err) {
			return spinnerLoading.fail(chalk.red('Unable to start selenium server!'));
		}
		return initBrowser();
	});
}

// crawl profile for each name
function initBrowser(phantomJS) {
	wdio.run(initCrawlProfile, (err) => {
		if(err) {
			spinnerCrawl.fail(chalk.red(err.message));
		}
		while(listProfileName.length) {
			browser.pause(1000);
			loadProfile();
		}
		browser.end();
		if (phantomJS) {
			phantomJS.kill();
		}
		process.exit();
	});
}

// init crawl of profile
function initCrawlProfile() {
	browser.init();
	loadProfile();
}

// load profile
function loadProfile() {
	this.profileName = listProfileName.shift();
	browser.url(`https://instagram.com/${this.profileName}`);

	if (browser.isExisting('div.error-container')) {
		return spinnerCrawl.fail(chalk.red(`Profile ${this.profileName} doesn't exist!`));
	}

	spinnerLoading.succeed(chalk.green(`Profile successfully loaded for ${this.profileName}!`));
	spinnerCrawl.start();

	this.dataProfile = {
		alias: getValue('h1'),
		username: getValue('h2._79dar'),
		descriptionProfile: getValue('._bugdy span'),
		urlProfile: browser.getUrl(),
		urlImgProfile: getValue('._o0ohn img', 'src'),
		website: getValue('a._56pjv'),
		numberPosts: cleanNumber(getValue('ul._9o0bc li:first-child ._bkw5z')),
		numberFollowers: cleanNumber(getValue('ul._9o0bc li:nth-child(2) ._bkw5z')),
		numberFollowing: cleanNumber(getValue('ul._9o0bc li:nth-child(3) ._bkw5z')),
		private: browser.isVisible('h2._glq0k'),
		posts: [],
	};

	this.url = [];

	if (this.dataProfile.private === true) {
		return createFile();
	}

	return getAllPost();
}

function getAllPost() {
	if (browser.isExisting('a._8imhp')) {
		browser.click('a._8imhp');
	}
	while (this.url.length < this.dataProfile.numberPosts) {
		this.url = getValue('._nljxa a', 'href');
		browser.moveToObject('span._es4h6');
		browser.pause(200);
	}

	return browsePosts();
}

// catch error
function getValue(element, attribute) {
	const isExisting = browser.isExisting(element);

	if (isExisting) {
		if(attribute) {
			return browser.getAttribute(element, attribute);
		}
		return browser.getText(element);
	}

	return null;
}

// browse each post
function browsePosts() {
	const numberPost = this.dataProfile.numberPosts;
	while (this.dataProfile.posts.length < numberPost) {

		// access url
		browser.url(this.url.shift());
		var post = {
			url: browser.getUrl(),
			localization: getValue('a._kul9p', 'title'),
			date: getValue('time', 'title'),
			isVideo: browser.isVisible('video'),
		};

		// get different url if post is video or image
		if (post.isVideo) {
			post.urlMedia = getValue('video', 'src');
		} else {
			post.urlMedia = getValue('img._icyx7', 'src');
		}

		post.numberLikes = 0;
		post.numberViewers = 0;

		// get image
		if (browser.isVisible('span._9jphp span')) {
			post.numberLikes = cleanNumber(getValue('span._9jphp span'));
		}else if (browser.isVisible('span._tf9x3')) {
			post.numberLikes = cleanNumber(getValue('span._tf9x3'));
		}else if (browser.isVisible('._iuf51 a')) {
			post.numberLikes = cleanNumber(getValue('._iuf51 a'));
			if (typeof post.numberLikes === 'object') {
				post.numberLikes = cleanNumber(getValue('._iuf51 a').length);
			} else {
				post.numberLikes = 1;
			}
		}

		// get number view for video
		if(browser.isVisible('span._9jphp span')) {
			post.numberViewers = Number(getValue('span._9jphp span').replace(/,/g, ''));
			delete post.numberLikes;
		}

		// get number comment
		var comments = getValue('._mo9iw li');
		if (_.isArray(comments)) {
			post.numberComments = Number(comments.length) - 1;
		} else if(comments && _.isString(comments)) {
			post.numberComments = 1;
		}else {
			post.numberComments = 0;
		}

		// get description
		var description = getValue('li._nk46a h1 span');
		if (description) {
			post.description = description.trim();
			post.tags = description.replace(/\r?\n|\r/g, ' ').split(' ').filter(n => /^#/.exec(n)) || [];
			post.mentions = description.replace(/\r?\n|\r/g, ' ').split(' ').filter(n => /^@/.exec(n)) || [];
		}else if (getValue('li a._4zhc5', 'title') === this.dataProfile.alias) {
			post.description = getValue('li._nk46a span');
		}else {
			post.description = '';
		}

		// get mentions in image
		var mentionsImage = getValue('a._ofpcv', 'href');
		if (mentionsImage) {
			if (_.isArray(mentionsImage)) {
				mentionsImage = mentionsImage.join(',')
					.replace(/https:\/\/www.instagram.com\//g, '@')
					.replace(/\//g, '')
					.split(',');
				post.mentions = post.mentions.concat(mentionsImage);
			}else {
				mentionsImage = mentionsImage.replace(/https:\/\/www.instagram.com\//g, '@').replace(/\//g, '');
				post.mentions.push(mentionsImage);
			}
		}
		this.dataProfile.posts.push(post);
		spinnerCrawl.text = `Advancement of crawl : ${this.dataProfile.posts.length}/${numberPost}`;
	}

	return createFile();
}

// clean number
function cleanNumber(number) {
	var numberClean = Number(number.replace(/[a-z]/g, '').replace(/[.|,]/g, '').trim());
	if (/\dm/.test(number)) {
		numberClean = Number(''+numberClean + '00000');
	} else if(/\dk/.test(number)) {
		numberClean = Number(''+numberClean + '00');
	}
	if(_.isNaN(numberClean)) {
		return 0;
	}
	return numberClean;
}

// create file of user profile
function createFile() {
	fs.writeFile(`profile ${this.dataProfile.alias}.json`, JSON.stringify(this.dataProfile, null, 2), 'utf-8', (err) => {
		if (err) {
			return spinnerCrawl.fail(chalk.red(`Error : ${err.message}`));
		}
		return spinnerCrawl.succeed(chalk.green('File created with success!'));
	});
}