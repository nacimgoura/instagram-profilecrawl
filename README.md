<img src="http://diylogodesigns.com/blog/wp-content/uploads/2016/05/instagram-Logo-PNG-Transparent-Background-download.png" width="140" align="right">

# Instagram-Profilecrawl 
[![NPM version](https://img.shields.io/npm/v/instagram-profilecrawl.svg)](https://www.npmjs.com/package/instagram-profilecrawl)
[![Build Status](https://travis-ci.org/nacimgoura/instagram-profilecrawl.svg?branch=master)](https://travis-ci.org/nacimgoura/instagram-profilecrawl)
[![built with NodeJS](https://img.shields.io/badge/Built%20with-nodejs-green.svg)](https://www.nodejs.org/)
[![built with Selenium](https://img.shields.io/badge/built%20with-Selenium-red.svg)](https://github.com/SeleniumHQ/selenium)
[![dependances](https://david-dm.org/nacimgoura/instagram-profilecrawl.svg)](https://david-dm.org/nacimgoura/instagram-profilecrawl)

## Quickly crawl the information (e.g. followers, tags, mentions, date, etc...) of an instagram profile. No login required!
Automation Script for crawling information from multiple instagram profile, 
like the number of posts, followers, tags and mentions of the posts.

Two way to crawl profile data in Instagram :
- use Instagram API
- use Selenium with chromedriver

# last change
- Remove lodash and unix-timestamp dependencies
- Update code for work with new Insta UI
- Add headless mode

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
	$ instagram-profilecrawl <name> <name>

	Examples
	  $ instagram-profilecrawl nacimgoura
```
If you've encountered a problem and you need some help, please let me an issue.

## Example 
You can find complete examples in the example folder.

Example : 
```
{
  "alias": "nacimgoura",
  "username": "Nacim 🇫🇷🇲🇦",
  "descriptionProfile": "Student 👨🏼‍🎓\nBesançon - Lyon📍\nCapturing the World 🌍📸",
  "urlProfile": "https://www.instagram.com/nacimgoura",
  "urlImgProfile": "https://scontent-cdg2-1.cdninstagram.com/t51.2885-19/s320x320/20987071_278425702639941_4940310501868437504_a.jpg",
  "website": null,
  "numberPosts": 7,
  "numberFollowers": 202,
  "numberFollowing": 499,
  "private": false,
  "official": false,
  "posts": [
    {
      "url": "https://www.instagram.com/p/BYOV8yBAU03",
      "urlImage": "https://scontent-cdg2-1.cdninstagram.com/t51.2885-15/e35/20987332_139270593343735_549544196554358784_n.jpg",
      "width": 1080,
      "height": 1080,
      "numberLikes": 31,
      "numberComments": 0,
      "isVideo": false,
      "multipleImage": false,
      "tags": [
        "#step",
        "#travel",
        "#architecture",
        "#garden",
        "#street",
        "#city",
        "#walk",
        "#tourism",
        "#park",
        "#stone",
        "#road",
        "#urban",
        "#atlas",
        "#instaday",
        "#morocco"
      ],
      "mentions": [],
      "description": "Ifrane, la petite Suisse 🎍\n.\n#step #travel #architecture #garden #street #city #walk #tourism #park #stone #road #urban #atlas #instaday #morocco",
      "date": "25 Aout 2017"
    },
        ...
  ]      
}
```

## License
MIT © [Nacim Goura](http://nacimgoura.fr)
