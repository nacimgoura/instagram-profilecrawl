#!/usr/bin/env node

const fs = require('fs');
const wdio = require('wdio');
const selenium = require('selenium-standalone');
const phantomjs = require('phantomjs-prebuilt');
const ora = require('ora');
const chalk = require('chalk');
const cli = require('./cli');

// init spinner
const spinnerLoading = ora('Loading Profile!').start();
const spinnerCrawl = ora('Begin of treatment!');

// test if browser exist
const browserName = Object.keys(cli.flags)[0];
if (cli.flags && !['chrome', 'firefox', 'phantomjs'].includes(browserName)) {
	return spinnerLoading.fail(chalk.red('Invalid browser!'));
}

// test if name is entered
const profileName = cli.input[0];
if (!profileName) {
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

function initBrowser(phantomJS) {
	wdio.run(initCrawlProfile, () => {
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
	browser.url(`https://instagram.com/${profileName}`);

	if (browser.isExisting('div.error-container')) {
		return failCrawl('This profile does not exist!');
	}

	spinnerLoading.succeed(chalk.green('Profile successfully loaded!'));
	spinnerCrawl.start();

	this.dataProfile = {
		alias: getValue('h1'),
		username: getValue('h2._79dar'),
		description: getValue('._bugdy span'),
		urlImgProfile: getValue('._o0ohn img', 'attribute', 'src'),
		website: getValue('a._56pjv'),
		numberOfPosts: Number(getValue('ul._9o0bc li:first-child ._bkw5z').replace(',', '')) || 0,
		numberFollowers: Number(getValue('ul._9o0bc li:nth-child(2) ._bkw5z').replace(',', '')) || 0,
		numberFollowing: Number(getValue('ul._9o0bc li:nth-child(3) ._bkw5z').replace(',', '')) || 0,
		private: browser.isVisible('h2._glq0k'),
		posts: [],
	};

	if (this.dataProfile.private === true) {
		return createFile();
	}
	return browsePosts();
}

// catch error
function getValue(element, type, typeAttribute) {
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

	return null;
}

function browsePosts() {
	browser.click('._myci9:first-child a:first-child');
	const numberPost = this.dataProfile.numberOfPosts;
	while (this.dataProfile.posts.length < numberPost) {
		while (!getValue('._n3cp9 ._jjzlb img', 'attribute', 'src') && !browser.isVisible('video')) {
			browser.pause(300);
		}
		const post = {
			url: browser.getUrl(),
			localization: getValue('a._kul9p', 'attribute', 'title'),
			isVideo: browser.isVisible('video'),
		};
		if (post.isVideo) {
			post.urlMedia = getValue('video', 'attribute', 'src');
		} else {
			post.urlMedia = getValue('._n3cp9 ._jjzlb img', 'attribute', 'src');
		}
		post.numberLikes = getValue('span._tf9x3 span');
		post.numberViewers = getValue('span._9jphp span');
		if(post.numberLikes) {
			post.numberLikes = Number(post.numberLikes.replace(',', ''));
			delete post.numberViewers;
		}else if(post.numberViewers) {
			post.numberViewers = Number(post.numberViewers.replace(',', ''));
			delete post.numberLikes;
		}
		if (typeof getValue('._mo9iw li') === 'object') {
			post.numberComments = Number(getValue('._mo9iw li').length) - 1;
		} else {
			post.numberComments = 0;
		}
		const description = getValue('ul._mo9iw li:first-child span');
		post.description = description.toLowerCase().replace(/([@#])[a-z\u00E0-\u00FC-_\d]*/g, '').trim();
		post.tags = description.split(' ').filter(n => /^#/.exec(n)) || [];
		post.mentions = description.split(' ').filter(n => /^@/.exec(n)) || [];
		this.dataProfile.posts.push(post);
		spinnerCrawl.text = `Advancement of crawl : ${this.dataProfile.posts.length}/${numberPost}`;
		if (this.dataProfile.posts.length < numberPost) {
			browser.click('a.coreSpriteRightPaginationArrow');
			while (browser.getUrl() === post.url) {
				browser.pause(300);
			}
		}
	}

	return createFile();
}

// create file of user profile
function createFile() {
	fs.writeFile(`profile ${this.dataProfile.alias}.json`, JSON.stringify(this.dataProfile, null, 2), 'utf-8', (err) => {
		if (err) {
			return failCrawl(err.message);
		}
		return spinnerCrawl.succeed(chalk.green('File created with success!'));
	});
}

// display error message
function failCrawl(message) {
	return spinnerCrawl.fail(chalk.red(`Error : ${message}`));
}
