
const wdio = require('wdio');
const selenium = require('selenium-standalone');
const ora = require('ora');
const chalk = require('chalk');
const utils = require('./utils');

const spinnerCrawl = ora('Init crawl!');
const options = {
	desiredCapabilities: {
		browserName: 'chrome',
		chromeOptions: {
			args: ['--headless', '--disable-gpu', '--window-size=1280,800', '--dns-prefetch-disable']
		}
	}
};
const browser = wdio.getBrowser(options);
let listProfileName = [];

/**
 * Init selenium with chrome on headless mode
 */
module.exports = {
	start(listName) {
		spinnerCrawl.start();
		listProfileName = listName;
		selenium.start(err => {
			if (err) {
				console.log(err);
				spinnerCrawl.fail(chalk.red('Unable to start selenium server!'));
				process.exit();
			}
			return initBrowser();
		});
	}
};

/**
 * Init chrome browser with selenium
 */
function initBrowser() {
	wdio.run(initCrawlProfile, err => {
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

// Init crawl of profile
function initCrawlProfile() {
	browser.init();
	return loadProfile();
}

// Load profile
function loadProfile() {
	this.profileName = listProfileName.shift();
	browser.url(`https://instagram.com/${this.profileName}`);

    // Check if profile exist
	if (browser.isExisting('.dialog-404')) {
		return spinnerCrawl.fail(chalk.red(`Profile ${this.profileName} doesn't exist!`));
	}

	spinnerCrawl.succeed(chalk.green(`Profile successfully loaded for ${this.profileName}!`));
	spinnerCrawl.text = 'Begin of the first step!';
	spinnerCrawl.start();

	this.dataProfile = {
		alias: getValue('h1'),
		username: getValue('h2._kc4z2'),
		isOfficial: browser.isVisible('span.coreSpriteVerifiedBadge'),
		descriptionProfile: getValue('._tb97a span:first-child'),
		urlProfile: browser.getUrl(),
		urlImgProfile: getValue('._b0acm img', 'src'),
		website: getValue('a._ng0lj'),
		numberPosts: utils.cleanNumber(getValue('ul._h9luf li:first-child ._fd86t')),
		numberFollowers: utils.cleanNumber(getValue('ul._h9luf li:nth-child(2) ._fd86t')),
		numberFollowing: utils.cleanNumber(getValue('ul._h9luf li:nth-child(3) ._fd86t')),
		private: browser.isVisible('h2._kcrwx'),
		posts: []
	};

	// If profile is private, posts is empty so create file now
	if (this.dataProfile.private === true || this.dataProfile.numberPosts === 0) {
		return utils.createFile(this.dataProfile);
	}

	// If button 'Load more' exist, click on
	if (browser.isExisting('a._1cr2e')) {
		browser.pause(400);
		browser.click('a._1cr2e');
	}

	return extractUrlPostProfile();
}

// Get all url in profile
function extractUrlPostProfile() {
	const self = this;
	let i = 1;
	let j = 1;

	if (browser.isExisting('a._1cr2e')) {
		browser.click('a._1cr2e');
	}

	/**
	 * For each image, move to for display number of likes and comments
	 */
	function moveToObject() {
		if (self.dataProfile.posts.length === self.dataProfile.numberPosts) {
			this.urls = getValue('._cmdpi a', 'href');
			if (!Array.isArray(this.urls)) {
				this.urls = [this.urls];
			}
			spinnerCrawl.succeed(chalk.green('End of the first step!'));
			return browsePosts();
		}
		const item = `._70iju:nth-child(${i}) ._mck9w:nth-child(${j})`;
		while (!browser.isVisible(item)) {
			browser.pause(100);
		}
		browser.moveToObject(item);
		let numberLikes = getValue(`${item} ._mli86 ul li:nth-child(1) span:first-child`);
		while (!numberLikes) {
			browser.pause(100);
			numberLikes = getValue(`${item} ._mli86 ul li:nth-child(1) span:first-child`);
		}
		const numberViews = numberLikes;
		const post = {
			url: getValue(`${item} a`, 'href'),
			urlImage: getValue(`${item} img`, 'src'),
			numberLikes: utils.cleanNumber(numberLikes),
			numberViews: utils.cleanNumber(numberViews),
			numberComments: utils.cleanNumber(getValue(`${item} ._mli86 ul li:nth-child(2) span:first-child`)),
			isVideo: browser.isVisible(`${item} span.coreSpriteVideoIconLarge`),
			multipleImage: browser.isVisible(`${item} span.coreSpriteSidecarIconLarge`),
			tags: [],
			mentions: []
		};

		const description = getValue(`${item} img`, 'alt');
		if (description && typeof description === 'string') {
			post.description = description.trim();
			post.tags = utils.getTags(description);
			post.mentions = utils.getMentions(description);
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
	browser.moveToObject('footer');
	moveToObject();
}

// Browse each post
function browsePosts() {
	spinnerCrawl.start();

	const numberPost = this.dataProfile.numberPosts;
	let number = 0;
	while (this.urls.length > 0) {
        // Access url
		const currentUrl = this.urls.shift();
		browser.url(currentUrl);
		const post = this.dataProfile.posts.find(n => {
			return n.url === currentUrl;
		});
		post.localization = getValue('a._q8ysx');
		post.date = getValue('time', 'title');

        // Get different url if post is video or image
		if (post.isVideo) {
			post.urlVideo = getValue('video', 'src');
		}

        // Get multiple image if exist
		if (post.multipleImage) {
			post.urlImage = [post.urlImage];
			while (browser.isExisting('a.coreSpriteRightChevron')) {
				browser.click('a.coreSpriteRightChevron');
				let image = getValue('img', 'src');
				let video = getValue('video', 'src');
				while (!image && !video) {
					browser.pause(100);
					image = getValue('img', 'src');
					video = getValue('video', 'src');
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

        // Get precise number likes
		const numberLikes = utils.cleanNumber(getValue('span._nzn1h span:first-child'));
		if (post.numberLikes > 11 && numberLikes > post.numberLikes) {
			post.numberLikes = numberLikes;
		}

        // Get number view for video
		if (browser.isVisible('span._9jphp span') && post.numberViews > 0) {
			post.numberViews = utils.cleanNumber(getValue('span._9jphp span'));
			delete post.numberLikes;
		} else {
			delete post.numberViews;
		}

        // Get mentions in image
		let mentionsImage = getValue('a._4dsc8', 'href');
		if (mentionsImage) {
			if (Array.isArray(mentionsImage)) {
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

	return utils.createFile(this.dataProfile)
        .then(() => spinnerCrawl.succeed(chalk.green('File created with success!')))
        .catch(err => spinnerCrawl.fail(chalk.red(`Error : ${err.message}`)));
}

// Catch error
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
