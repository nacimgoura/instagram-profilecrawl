#!/usr/bin/env node

const { promisify } = require('util');
const fs = require('fs');
const puppeteer = require('puppeteer');
const meow = require('meow');
const ora = require('ora');
const writeYaml = require('write-yaml');
const element = require('./element.json');

const writeFileAsync = promisify(fs.writeFile);
const writeYamlAsync = promisify(writeYaml);

const cli = meow(
	`
	Usage
    	$ instagram-profilecrawl <name>

	Options
		--output -o           define output format (JSON, YAML)
		--limit -l	  	      get only the number of post defined by the limit
		--interactive -i	  no headless mode

	Examples
		$ instagram-profilecrawl nacimgoura
		$ instagram-profilecrawl nacimgoura -o yaml
		$ instagram-profilecrawl nacimgoura -o yaml - l 10
`,
	{
		flags: {
			output: {
				type: 'string',
				alias: 'o'
			},
			limit: {
				type: 'string',
				alias: 'l'
			},
			interactive: {
				type: 'boolean',
				alias: 'i'
			}
		}
	}
);

const CrawlerInstagram = class {
	constructor() {
		this.spinner = ora('Beginning of the crawl!').start();
	}

	async start({ input, flags }) {
		// Variable
		this.input = input[0];
		this.output = flags && flags.output ? flags.output : null;
		this.limit = flags && flags.limit ? flags.limit : null;
		this.interactive = flags && flags.interactive ? flags.interactive : false;

		// Init browser
		this.browser = await puppeteer.launch({
			headless: !this.interactive,
			args: ['--lang=en-US', '--disk-cache-size=0']
		});

		// Go to profile page in english
		this.page = await this.browser.newPage();
		await this.page.setExtraHTTPHeaders({
			'Accept-Language': 'en-US'
		});
		await this.page.goto(`https://instagram.com/${input}`, {
			waitUntil: 'networkidle0'
		});

		// Close if profil doesn't exist
		if (await this.page.$(element.notExist)) {
			this.spinner.fail("Profile doesn't exist");
			process.exit();
		}

		// FUTUR: await this.login();

		try {
			this.dataProfile = {
				urlProfile: this.page.url(),
				...(await this.getInfoProfile()),
				posts: await this.getDataPostProfile()
			};
			this.spinner.succeed('end crawl profile!');
			await this.writeProfile();
			this.spinner.succeed('file created with success!');
		} catch (error) {
			console.error(error);
			this.spinner.fail('Unable to crawl profile data!');
			process.exit();
		}
		await this.browser.close();
	}

	// Get info in profil
	async getInfoProfile() {
		this.spinner.info('Get profile info!');
		return this.page.evaluate(element => {
			return {
				alias: document.querySelector(element.alias).innerText,
				username: document.querySelector(element.username).innerText,
				descriptionProfile: document.querySelector(element.descriptionProfile)
					? document.querySelector(element.descriptionProfile).innerText
					: '',
				urlImgProfile: document
					.querySelector(element.urlImgProfile)
					.getAttribute('src'),
				website: document.querySelector(element.website)
					? document.querySelector(element.website).innerText
					: null,
				numberPosts: document.querySelector(element.numberPosts).innerText,
				numberFollowers: document.querySelector(element.numberFollowers)
					.innerText,
				numberFollowing: document.querySelector(element.numberFollowing)
					.innerText,
				private: !!document.querySelector(element.isPrivate),
				isOfficial: !!document.querySelector(element.isOfficial)
			};
		}, element);
	}

	// Get data for each post
	async getDataPostProfile() {
		this.spinner.info('Get list post!');
		let numberPosts = await this.page.evaluate(element => {
			return document.querySelector(element.numberPosts).innerText;
		}, element);
		if (this.limit) {
			numberPosts = this.limit;
		}
		const listPostUrl = new Set();
		// Get all post url
		while (listPostUrl.size < Number(numberPosts)) {
			const listUrl = await this.page.$$eval(element.listPost, list =>
				list.map(n => n.getAttribute('href'))
			);
			listUrl.forEach(url => {
				if (!this.limit || (this.limit && listPostUrl.size < this.limit)) {
					listPostUrl.add(url);
				}
			});
			await this.page.evaluate(() => {
				window.scrollTo(0, 1000000);
			});
		}

		await this.page.close();

		const listPost = [];

		this.spinner.info('Crawl each post!');
		for (const url of listPostUrl) {
			const page = await this.browser.newPage();
			await page.goto(`https://instagram.com${url}`, {
				waitUntil: 'networkidle0'
			});
			this.spinner.info(`crawl -> ${url}`);
			const data = await page.evaluate(element => {
				return {
					url: element.url,
					urlImage: document.querySelector(element.urlImage)
						? document.querySelector(element.urlImage).getAttribute('srcset')
						: null,
					isVideo: !!document.querySelector(element.video),
					video: document.querySelector(element.video)
						? document.querySelector(element.video).getAttribute('src')
						: null,
					numberLike: document.querySelector(element.numberLike)
						? document.querySelector(element.numberLike).innerText
						: null,
					numberView: document.querySelector(element.numberView)
						? document.querySelector(element.numberView).innerText
						: null,
					numberComments: document.querySelectorAll(element.numberComments)
						.length,
					description: document.querySelector(element.description)
						? document.querySelector(element.description).innerText
						: null,
					tags: document.querySelector(element.tags)
						? document.querySelector(element.tags).innerText.match(/#\w+/g)
						: [],
					mentions:
						[...document.querySelectorAll(element.mentions)].map(item =>
							item.getAttribute('href')
						) || [],
					date: document.querySelector(element.date).getAttribute('datetime'),
					multipleImage: !!document.querySelector(element.multipleImage)
				};
			}, element);
			if (data.multipleImage === true) {
				data.urlImage = [data.urlImage];
				while ((await page.$(element.multipleImage)) !== null) {
					await page.click(element.multipleImage);
					data.urlImage.push(await page.$eval(element.urlImage, a => a.srcset));
				}
			}
			await page.close();
			listPost.push(data);
		}
		return listPost;
	}

	// Enable to crawl private profile (For the futur)
	async login() {}

	// Write profile in file
	async writeProfile() {
		if (this.output === 'yaml') {
			return writeYamlAsync(`${this.input}.yml`, this.dataProfile);
		}
		return writeFileAsync(
			`${this.input}.json`,
			JSON.stringify(this.dataProfile, null, 2)
		);
	}
};

// Start program
const crawler = new CrawlerInstagram();
crawler.start(cli).catch(error => console.error(error));
