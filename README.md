<img src="http://diylogodesigns.com/blog/wp-content/uploads/2016/05/instagram-Logo-PNG-Transparent-Background-download.png" width="140" align="right">

# Instagram-Profilecrawl

[![NPM version](https://img.shields.io/npm/v/instagram-profilecrawl.svg)](https://www.npmjs.com/package/instagram-profilecrawl)
[![Build Status](https://travis-ci.org/nacimgoura/instagram-profilecrawl.svg?branch=master)](https://travis-ci.org/nacimgoura/instagram-profilecrawl)
[![built with NodeJS](https://img.shields.io/badge/Built%20with-nodejs-green.svg)](https://www.nodejs.org/)
[![built with Selenium](https://img.shields.io/badge/built%20with-Selenium-red.svg)](https://github.com/SeleniumHQ/selenium)
[![dependances](https://david-dm.org/nacimgoura/instagram-profilecrawl.svg)](https://david-dm.org/nacimgoura/instagram-profilecrawl)

## Changes introduced by this fork

Selenium is now an optional dependency. If you want to use the script in that mode (instead of API mode), you have to run the following commands first:

```text
npm install selenium-standalone@latest -g
selenium-standalone install
```

## Quickly crawl the information (e.g. followers, tags, mentions, date, etc...) of an instagram profile. No login required!
Automation Script for crawling information from multiple instagram profile,
like the number of posts, followers, tags and mentions of the posts.
Inspired by [this project](https://github.com/timgrossmann/instagram-profilecrawl) but made in nodeJS and more complete.

Two way to crawl profile data in Instagram :
- use Instagram API (the faster)
- use Selenium with chromedriver (more complete but slower)

**If you've encountered a problem and you need some help,
please let me an issue.**

## Functionality
 - crawl the number of followers, followings and posts
 - It's possible to crawl multiple accounts
 - crawl each post with number of likes and comments
 - crawl date, localization, description, tags and mention
 - crawl image and video
 - work with instagram in different language (english, french, german...)
 - Headless mode

## Install
```
npm install -g instagram-profilecrawl
```
If you encounter an error on windows, do :

```
npm install -g windows-build-tools
npm install -g instagram-profilecrawl
```

## Usage
```
Usage
	  $ instagram-profilecrawl <input>

	Options
	  --method, -m define method (default api)
	  --output, -o define output file (default profile_<input>.json)

	Examples
	  $ instagram-profilecrawl nacimgoura --method=selenium
```

## Example
You can find complete examples in the example folder.

<img src="img/example.png">

## Contributor
- [thosuperman](https://github.com/thosuperman)
- [eek](https://github.com/eek)
- [marcospgp](https://github.com/marcospgp)


## License
MIT © [Nacim Goura](http://nacimgoura.fr)
