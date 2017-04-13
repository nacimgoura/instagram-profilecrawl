
const meow = require('meow');

module.exports = meow(`
	Usage
	  $ instagram-profilecrawl <name>
	  
	Options
	  --chrome      use chrome
	  --firefox     use firefox
	  --phantomjs   use phantomjs

	Examples
	  $ instagram-profilecrawl nacimgoura
`, {
	default: { chrome: true },
});
