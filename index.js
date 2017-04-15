#!/usr/bin/env node

const fs = require('fs');
const wdio = require('wdio');
const selenium = require('selenium-standalone');
const ora = require('ora');
const chalk = require('chalk');
const _ = require('lodash');
const cli = require('./cli');

// init spinner
const spinnerLoading = ora('Init script!').start();
const spinnerCrawl = ora('Begin of the first step!');

// test if name is entered
const listProfileName = cli.input;
if (listProfileName.length === 0) {
	spinnerLoading.fail(chalk.red('No name entered!'));
	process.exit();
}

// create browser
const options = {
	desiredCapabilities: {
		browserName: 'chrome',
	},
};
const browser = wdio.getBrowser(options);

// init selenium server
selenium.start((err) => {
	if (err) {
		return spinnerLoading.fail(chalk.red('Unable to start selenium server!'));
	}
	return initBrowser();
});

// crawl profile for each name
function initBrowser() {
	wdio.run(initCrawlProfile, (err) => {
		if (err) {
			spinnerCrawl.fail(chalk.red(err.message));
		}
		while (listProfileName.length) {
			loadProfile();
		}
		browser.end();
		process.exit();
	});
}

// init crawl of profile
function initCrawlProfile() {
	browser.init();
	return loadProfile();
}

// load profile
function loadProfile() {
	this.profileName = listProfileName.shift();
	browser.url(`https://instagram.com/${this.profileName}`);

	// check if profile exist
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

	if (this.dataProfile.private === true || this.dataProfile.numberPosts === 0) {
		return createFile();
	}

	if (browser.isExisting('a._8imhp')) {
		browser.pause(200);
		browser.click('a._8imhp');
	}

	return extractUrlPostProfile();
}

// get all url in profile
function extractUrlPostProfile() {
	const self = this;
	var i = 1;
	var j = 1;

	if (browser.isExisting('a._8imhp')) {
		browser.click('a._8imhp');
	}

	function moveToObject() {
		if (self.dataProfile.posts.length === self.dataProfile.numberPosts) {
			this.urls = getValue('._nljxa a', 'href');
			spinnerCrawl.succeed(chalk.green('End of the first step!'));
			return browsePosts();
		}
		const item = `._nljxa ._myci9:nth-child(${i}) a:nth-child(${j})`;
		browser.moveToObject(item);
		while (_.isNull(getValue(`${item} img`, 'src'))) {
			browser.pause(100);
		}
		var post = {
			url: getValue(item, 'href'),
			urlImage: getValue(`${item} img`, 'src'),
			numberLikes: cleanNumber(getValue(`${item} li._sjq6j span:first-child`)),
			numberViews: cleanNumber(getValue(`${item} li._9ym92 span:first-child`)),
			numberComments: cleanNumber(getValue(`${item} li._qq2if span:first-child`)),
			isVideo: browser.isVisible(`${item} span.coreSpriteVideoIconLarge`),
			multipleImage: browser.isVisible(`${item} span.coreSpriteSidecarIconLarge`),
			tags: [],
			mentions: [],
		};

		const description = getValue(`${item} img`, 'alt');
		if (description && _.isString(description)) {
			post.description = description.trim();
			post.tags = description.replace(/\r?\n|\r/g, ' ').split(' ').filter(n => /^#/.exec(n)) || [];
			post.mentions = description.replace(/\r?\n|\r/g, ' ').split(' ').filter(n => /^@/.exec(n)) || [];
		} else {
			post.description = '';
		}

		if (j === 3) {
			j = 1;
			i++;
		} else {
			j++;
		}

		self.dataProfile.posts.push(post);
		spinnerCrawl.text = `Advancement of the first step : ${self.dataProfile.posts.length}/${self.dataProfile.numberPosts}`;

		return moveToObject();
	}

	browser.pause(1000);
	browser.moveToObject('img._iv4d5');
	moveToObject();
}

// browse each post
function browsePosts() {
	spinnerCrawl.start();

	const numberPost = this.dataProfile.numberPosts;
	var number = 0;
	while (this.urls.length > 0) {
		// access url
		browser.url(this.urls.shift());
		var post = _.find(this.dataProfile.posts, {
			url: `${browser.getUrl()}?taken-by=${this.dataProfile.alias}`,
		});
		post.localization = getValue('a._kul9p', 'title');
		post.date = getValue('time', 'title');

		// get different url if post is video or image
		if (post.isVideo) {
			post.urlVideo = getValue('video', 'src');
		}

		// get multiple image if exist
		if (post.multipleImage) {
			post.urlImage = [post.urlImage];
			while (browser.isExisting('a.coreSpriteRightChevron')) {
				browser.click('a.coreSpriteRightChevron');
				var image = getValue('img._icyx7', 'src');
				var video = getValue('video', 'src');
				while (_.isNull(image) && _.isNull(video)) {
					image = getValue('img._icyx7', 'src');
					video = getValue('video', 'src');
					browser.pause(100);
				}
				if (browser.isVisible('video')) {
					if (post.urlVideo) {
						post.urlVideo = [post.urlVideo];
					} else {
						post.urlVideo = [];
					}
					post.urlVideo.push(video);
				} else {
					post.urlImage.push(image);
				}
			}
		}

		// get precise number likes
		if ((browser.isVisible('span._tf9x3') && post.numberLikes > 11) || post.numberLikes !== 0) {
			post.numberLikes = cleanNumber(getValue('span._tf9x3'));
		}

		// get number view for video
		if (browser.isVisible('span._9jphp span') && post.numberViews > 0) {
			post.numberViews = cleanNumber(getValue('span._9jphp span'));
			delete post.numberLikes;
		} else {
			delete post.numberViews;
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
			} else {
				mentionsImage = mentionsImage.replace(/https:\/\/www.instagram.com\//g, '@').replace(/\//g, '');
				post.mentions.push(mentionsImage);
			}
		}
		number++;
		spinnerCrawl.text = `Advancement of second step : ${number}/${numberPost}`;
	}

	return createFile();
}

// catch error
function getValue(element, attribute) {
	const isExisting = browser.isExisting(element);

	if (isExisting) {
		if (attribute) {
			return browser.getAttribute(element, attribute);
		}
		return browser.getText(element);
	}

	return null;
}

// clean number
function cleanNumber(number) {
	if (number) {
		var numberClean = Number(number.replace(/[a-z]/g, '').replace(/[.|,]/g, '').trim());
		if (/\dm/.test(number)) {
			numberClean = Number(`${numberClean}00000`);
		} else if (/\dk/.test(number)) {
			numberClean = Number(`${numberClean}00`);
		}
		if (_.isNaN(numberClean)) {
			return 0;
		}
		return numberClean;
	}
	return 0;
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