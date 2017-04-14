<img src="https://s3-eu-central-1.amazonaws.com/centaur-wp/designweek/prod/content/uploads/2016/05/11170038/Instagram_Logo-1002x1003.jpg" width="200" align="right">

# Instagram-Profilecrawl

[![NPM version](https://img.shields.io/npm/v/instagram-profilecrawl.svg)](https://www.npmjs.com/package/instagram-profilecrawl)
[![Build Status](https://travis-ci.org/nacimgoura/instagram-profilecrawl.svg?branch=master)](https://travis-ci.org/nacimgoura/instagram-profilecrawl)
[![built with NodeJS](https://img.shields.io/badge/Built%20with-nodejs-green.svg)](https://www.nodejs.org/)
[![built with Selenium](https://img.shields.io/badge/built%20with-Selenium-red.svg)](https://github.com/SeleniumHQ/selenium)

## Quickly crawl the information (e.g. followers, tags etc...) of an instagram profile. No login required!
Automation Script for crawling information from ones instagram profile.  
Like e.g. the number of posts, followers, and the tags of the the posts

**Currently, This project is compatible with nodejS > 4**

**Note** : I forked [instagram-profilecrawl](https://github.com/timgrossmann/instagram-profilecrawl)
created by [timgrossmann](https://github.com/timgrossmann).
I'm not a Python developer but I was very interested in this project so I realized
the same thing but in nodeJS, bringing some improvements.
I chose to use also selenium because it's something cool.

#### Getting started
Just do :
```bash
npm install -g instagram-profilecrawl

Usage
	$ instagram-profilecrawl <name> <name> <name>
	  
	Options
	  --chrome      use chrome
	  --firefox     use firefox
	  --phantomjs   use phantomjs
	  --opera       use opera
	  --safari      use safari
	  --edge        use edge
	  --ie          use internet explorer

	Examples
	  $ instagram-profilecrawl nacimgoura
```
**It is possible to crawl several accounts following!**

If you encounter an error on windows, do :

```
npm install -g windows-build-tools
npm install -g instagram-profilecrawl
```

**Important** : Even if it is possible to use different browser, I advise
to use chrome because I realized this application on chrome.
I tested on firefox and it works well too.
I encountered a problem with phantomjs, it doesn't manage to recover
the number of posts which blocks for the rest of the program.
I am currently working on solving these problems, but I accept any help.

The information will be saved in a JSON-File same profile {username}.json.
Exemple of data : 
```
{
  {
    "alias": "nacimgoura",
    "username": "Nacim",
    "descriptionProfile": "French student 🇫🇷 «La vie est un conte de fée qui perd ses pouvoirs magique lorsque nous grandissons.»",
    "urlProfile": "https://www.instagram.com/nacimgoura/",
    "urlImgProfile": "https://scontent-cdg2-1.cdninstagram.com/t51.2885-19/s150x150/17662950_1416155488436522_4443366366061264896_a.jpg",
    "website": "nacimgoura.xyz",
    "numberPosts": 22,
    "numberFollowers": 390,
    "numberFollowing": 410,
    "private": false,
    "posts": [
      {
        "url": "https://www.instagram.com/p/BSy5fM-gkTB/?taken-by=nacimgoura",
        "localization": "Besançon, France",
        "date": "Apr 12, 2017",
        "isVideo": false,
        "urlMedia": "https://scontent-frt3-1.cdninstagram.com/t51.2885-15/e35/17882589_765690586924244_1094628417464172544_n.jpg",
        "numberLikes": 23,
        "numberViewers": 0,
        "numberComments": 1,
        "description": "piano time 🎹",
        "tags": [
          "#piano",
          "#music",
          "#enattendantletrain",
          "#blackandwhite",
          "#artist"
        ],
        "mentions": []
      }
        ...
  ]      
}
```

| Browser  | Compatibility |
| ------------- | ------------- |
| Chrome  | 100%  |
| Firefox  | 80% (The new page doesn't appear after clicking but it retrieves the data correctly)  |
| PhantomJS  | 30% (unable to get number of posts and number of likes so fail) |
| Edge  | Not tested  |
| Safari  | Not tested  |
| Opera  | Not tested  |

