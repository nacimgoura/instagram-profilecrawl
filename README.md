<img src="http://diylogodesigns.com/blog/wp-content/uploads/2016/05/instagram-Logo-PNG-Transparent-Background-download.png" width="150" align="right">

# Instagram-Profilecrawl 
[![NPM version](https://img.shields.io/npm/v/instagram-profilecrawl.svg)](https://www.npmjs.com/package/instagram-profilecrawl)
[![Build Status](https://travis-ci.org/nacimgoura/instagram-profilecrawl.svg?branch=master)](https://travis-ci.org/nacimgoura/instagram-profilecrawl)
[![built with NodeJS](https://img.shields.io/badge/Built%20with-nodejs-green.svg)](https://www.nodejs.org/)
[![built with Selenium](https://img.shields.io/badge/built%20with-Selenium-red.svg)](https://github.com/SeleniumHQ/selenium)
[![dependances](https://david-dm.org/nacimgoura/instagram-profilecrawl.svg)](https://david-dm.org/nacimgoura/instagram-profilecrawl)

## Quickly crawl the information (e.g. followers, tags, mentions, date, etc...) of an instagram profile. No login required!
Automation Script for crawling information from multiple instagram profile, 
like the number of posts, followers, tags and mentions of the posts.

**Note** : This is an original idea of [timgrossmann](https://github.com/timgrossmann)
with the project [instagram-profilecrawl](https://github.com/timgrossmann/instagram-profilecrawl)
realized in Python.
I'm not a Python developer but I was very interested in this project so I realized
the same thing but in nodeJS, bringing some improvements.

## Functionality
 - crawl the number of followers, followings and posts
 - It's possible to crawl several accounts following
 - crawl each post with number of likes and comments
 - crawl date, localization, description, tags and mention
 - work with all type of media
 - support multiple image
 - work with different language
 
 **The movements of the user on the browser can influence the behavior of the script. 
 Don't move the mouse in the browser.**

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

## Example 
You can find complete examples in the example folder.

Structure of data : 
```
{
  {
    "alias": "nacimgoura",
     "username": "Nacim",
     "descriptionProfile": "French student 🇫🇷 Peu importe ce que tu décideras de faire, assure-toi que cela te rende heureux 💭",
     "urlProfile": "https://www.instagram.com/nacimgoura/",
     "urlImgProfile": "https://scontent-cdg2-1.cdninstagram.com/t51.2885-19/s150x150/17661924_190760414771421_7396112818207981568_a.jpg",
     "website": "nacimgoura.fr",
     "numberPosts": 23,
     "numberFollowers": 394,
     "numberFollowing": 417,
     "private": false,
     "posts": [
      {
        "url": "https://www.instagram.com/p/BSy5fM-gkTB/?taken-by=nacimgoura",
        "urlImage": "https://scontent-frt3-1.cdninstagram.com/t51.2885-15/e35/17882589_765690586924244_1094628417464172544_n.jpg",
        "numberLikes": 28,
        "numberComments": 1,
        "isVideo": false,
        "multipleImage": false,
        "tags": [
                  "#piano",
                  "#music",
                  "#enattendantletrain",
                  "#blackandwhite",
                  "#artist"
                ],
        "mentions": []
        "description": "piano time 🎹",
        "localization": "Besançon, France",
        "date": "Apr 12, 2017"
      }
        ...
  ]      
}
```

## License 
MIT © [Nacim Goura](https://nacimgoura.xyz)