
const fs = require('fs');

module.exports = {

    // Clean number
	cleanNumber(number) {
		if (number) {
			let numberClean = Number(number.replace(/[a-z.,\s]/g, '').trim());
			if (/\dm/.test(number)) {
				numberClean = Number(`${numberClean}00000`);
			} else if (/\dk/.test(number)) {
				numberClean = Number(`${numberClean}000`);
			}
			if (!numberClean) {
				return 0;
			}
			return numberClean;
		}
		return 0;
	},

	getTags(string) {
		try {
			const tags = string.match(/#\w+/g);
			if (!tags) {
				return [];
			}
			return tags;
		} catch (e) {
			return [];
		}
	},

	getMentions(string) {
		try {
			const tags = string.match(/@\w+/g);
			if (!tags) {
				return [];
			}
			return tags;
		} catch (e) {
			return [];
		}
	},

    // Create final file of profile data
	createFile(data) {
		return new Promise((resolve, reject) => {
			fs.writeFile(`profile ${data.alias}.json`, JSON.stringify(data, null, 2), 'utf-8', err => {
				if (err) {
					return reject(err);
				}
				return resolve();
			});
		});
	}
};
