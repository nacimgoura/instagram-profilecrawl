<img src="https://s3-eu-central-1.amazonaws.com/centaur-wp/designweek/prod/content/uploads/2016/05/11170038/Instagram_Logo-1002x1003.jpg" width="200" align="right">

# Instagram-Profilecrawl

## Quickly crawl the information (e.g. followers, tags etc...) of an instagram profile. No login required!
Automation Script for crawling information from ones instagram profile.  
Like e.g. the number of posts, followers, and the tags of the the posts

[![Build Status](https://travis-ci.org/nacimgoura/instagram-profilecrawl.svg?branch=master)](https://travis-ci.org/nacimgoura/instagram-profilecrawl)
[![built with NodeJS](https://img.shields.io/badge/Built%20with-nodejs-green.svg)](https://www.nodejs.org/)
[![built with Selenium](https://img.shields.io/badge/built%20with-Selenium-red.svg)](https://github.com/SeleniumHQ/selenium)

Note : this is a fork of 
[instagram-profilecrawl](https://github.com/timgrossmann/instagram-profilecrawl)
created by [timgrossmann](https://github.com/timgrossmann).
I'm not a python developer but I was very interested in this project so I realized
the same thing but in nodeJS, bringing some improvements.
I chose to use also selenium because it's something cool.

#### Getting started
Just do:
```bash
npm install --g instagram-profilecrawl

Usage
	$ instagram-profile-crawl <name>
	  
	Options
	  --chrome      use chrome
	  --firefox     use firefox

	Examples
	  $ instagram-profile-crawl nacim_goura
```
The information will be saved in a JSON-File same profile {username}.json.

Important : Even if it is possible to use different browser, I advise
to use chrome because I realized this application on chrome and I did
not take the time to test on others.

Structure of data : 
```
{
  "alias": "nacim_goura",
  "username": "Nacim",
  "description": "French student",
  "urlImgProfile": "https://scontent-cdg2-1.cdninstagram.com/t51.2885-19/s150x150/17662950_1416155488436522_4443366366061264896_a.jpg",
  "numberOfPosts": "21",
  "numberFollowers": "391",
  "numberFollowing": "407",
  "private": false,
  "posts": [
        {
          "url": "https://www.instagram.com/p/BShIo0IAg00/?taken-by=nacim_goura",
          "urlImage": "https://scontent-cdg2-1.cdninstagram.com/t51.2885-15/s640x640/sh0.08/e35/c135.0.810.810/17818002_126533407886446_8602338629349539840_n.jpg",
          "numberLikes": "44",
          "numberComments": "1",
          "isVideo": false,
          "description": "Souvenir d'été 🌞",
          "tags": [
            "#landscape",
            "#nofilter",
            "#sun",
            "#summer",
            "#heat",
            "#nostalgia",
            "#morocco",
            "#home"
          ]
        },
        ...
  ]      
}
```
