#!/usr/bin/env node

const webdriver = require('webdriverio');
const wdio = require('wdio');
const fs = require('fs');
const meow = require('meow');
const ora = require('ora');
const chalk = require('chalk');

const spinner = ora('Loading Profile!').start();

const cli = meow(`
	Usage
	  $ instagram-profile-crawl <name>
	  
	Options
	  --chrome      use chrome
	  --firefox     use firefox

	Examples
	  $ instagram-profile-crawl nacim_goura
`, {
	default: {chrome: true},
});

if(cli.flags && !['chrome', 'firefox'].includes(Object.keys(cli.flags)[0])) {
	return spinner.fail(chalk.red('Invalid browser!'));
}

const name = cli.input[0];
if (!name) {
	return spinner.fail(chalk.red('No name entered!'));
}

const options = {
	desiredCapabilities: {
		browserName: Object.keys(cli.flags)[0],
	},
};

wdio.initSelenium({}, (err) => {
	if(err) {
		return spinner.fail(chalk.red('Selenium is not run!'));
	}
	wdio.run({}, function() {});
});

const browser = webdriver
	.remote(options)
	.init()
	.url(`http://www.instagram.com/${name}`)
	.then(() => {
		browser.deleteCookie();
		extractDataProfile.run(browser);
	});

const extractDataProfile = {

	async run(browser) {
		spinner.text = 'Start of treatment!';

		this.data = {
			alias: await this.getValue('h1'),
			username: await this.getValue('h2._79dar'),
			description: await this.getValue('._bugdy span'),
			urlImgProfile: await this.getValue('._o0ohn img', 'attribute', 'src'),
			numberOfPosts: await this.getValue('ul._9o0bc li:first-child ._bkw5z', 'text', 0),
			numberFollowers: await this.getValue('ul._9o0bc li:nth-child(2) ._bkw5z', 'text', '', 0),
			numberFollowing: await this.getValue('ul._9o0bc li:nth-child(3) ._bkw5z', 'text', '', 0),
			private: await browser.isVisible('h2._glq0k'),
			posts: [],
		};

		if (await browser.isExisting('div.error-container')) {
			return this.failInProfile('This profile does not exist!');
		}

		if(this.data.private === true) {
			this.createFile();
		}else {
			await this.extractUrlPostProfile();
		}
	},

	// get value in page and catch error
	async getValue(element, type = 'text', typeAttribute = '', defaultValue = '') {
		const isExisting = await browser.isExisting(element);

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
	},

	// extract all image url from profile
	async extractUrlPostProfile() {
		const self = this;

		let urls = await this.getValue('._nljxa a', 'attribute', 'href', []);
		if (urls.length > 0 && this.data.numberOfPosts > 12) {
			await this.loadButton();
			while (Number(this.data.numberOfPosts) !== urls.length) {
				await browser.scroll('body', 0, 15000).pause(1000);
				urls = await this.getValue('._nljxa a', 'attribute', 'href', []);
			}
		}
		let i = 1;
		let j = 1;

		async function moveToObject() {
			if (self.data.posts.length === self.data.numberOfPosts - 1) {
				return self.createFile();
			}

			try {
				const item = `._nljxa ._myci9:nth-child(${i}) a:nth-child(${j})`;
				browser.moveToObject(item)
					.then(async () => {
						const post = {
							url: await self.getValue(item, 'attribute', 'href'),
							urlImage: await self.getValue(`${item} img`, 'attribute', 'src'),
							numberLikes: await self.getValue(`${item} li._sjq6j span:first-child`, 'text', '', 0),
							numberComments: await self.getValue(`${item} li._qq2if span:first-child`, 'text', '', 0),
							isVideo: await browser.isVisible(`${item} ._qihym`),
						};
						const description = await self.getValue(`${item} img`, 'attribute', 'alt');
						post.description = description.replace(/#[a-z\u00E0-\u00FC]*/g, '').trim();
						post.tags = description.split(' ').filter(n => /^#/.exec(n));
						self.data.posts.push(post);

						if (j === 3) {
							j = 1;
							i++;
						} else {
							j++;
						}

						spinner.text = `${self.data.posts.length} posts processed!`;

						await moveToObject();
					});
			}catch (error) {
				this.failInProfile(error);
			}

		}

		await moveToObject();
	},

	// click on load button
	async loadButton() {
		const isVisible = await browser.isExisting('a._8imhp');
		if (isVisible) {
			await browser.click('a._8imhp');
		}
	},

	// create final file
	async createFile() {
		fs.writeFile(`profile ${this.data.alias}.json`, JSON.stringify(this.data, null, 2), 'utf-8', (err) => {
			if (err) throw err;
			spinner.succeed(chalk.green('File created with success!'));
			browser.end();
		});
	},

	failInProfile(message) {
		browser.end();
		return spinner.fail(chalk.red(`Error : ${message}`));
	},
};
