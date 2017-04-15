<img src="https://s3-eu-central-1.amazonaws.com/centaur-wp/designweek/prod/content/uploads/2016/05/11170038/Instagram_Logo-1002x1003.jpg" width="200" align="right">

## Instagram-Profilecrawl 
[![NPM version](https://img.shields.io/npm/v/instagram-profilecrawl.svg)](https://www.npmjs.com/package/instagram-profilecrawl)
[![Build Status](https://travis-ci.org/nacimgoura/instagram-profilecrawl.svg?branch=master)](https://travis-ci.org/nacimgoura/instagram-profilecrawl)
[![built with NodeJS](https://img.shields.io/badge/Built%20with-nodejs-green.svg)](https://www.nodejs.org/)
[![built with Selenium](https://img.shields.io/badge/built%20with-Selenium-red.svg)](https://github.com/SeleniumHQ/selenium)

## Quickly crawl the information (e.g. followers, tags, mentions, date, etc...) of an instagram profile. No login required!
Automation Script for crawling information from ones instagram profile, 
like the number of posts, followers, tags and mentions of the posts.

**Note** : This is an original idea of [timgrossmann](https://github.com/timgrossmann)
with the project [instagram-profilecrawl](https://github.com/timgrossmann/instagram-profilecrawl)
realized in Python.
I'm not a Python developer but I was very interested in this project so I realized
the same thing but in nodeJS, bringing some improvements.
**The movements of the user on the browser can influence the behavior of the script.**

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

## Functionality
 - crawl the number of followers, followings and posts
 - It's possible to crawl several accounts following
 - crawl each post with number of likes and comments
 - crawl date, localization, description, tags and mention
 - work with all type of media
 - support multiple image

## Example 
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
        "isVideo": false,
        "multipleImage": false,
        "urlMedia": "https://scontent-frt3-1.cdninstagram.com/t51.2885-15/e35/17882589_765690586924244_1094628417464172544_n.jpg",
        "numberLikes": 23,
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