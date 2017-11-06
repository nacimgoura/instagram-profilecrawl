
const got = require('got');
const ora = require('ora');
const chalk = require('chalk');
const utils = require('./utils');

const spinnerApi = ora('Init Api!');

module.exports = {

	/**
	 * For each name, load profile
	 * @param {Array} listProfileName
	 */
	start(listProfileName) {
		spinnerApi.start();
		listProfileName.forEach(profileName => {
			got(`https://instagram.com/${profileName}/?__a=1`, {json: true})
                .then(data => this.parseData(profileName, data.body));
		});
	},

	/**
	 * Parse data for each name
	 * @param {String} profileName
	 * @param {Object} data
	 */
	parseData(profileName, data) {
		this.parsedData = {
			alias: data.user.username,
			username: data.user.full_name,
			descriptionProfile: data.user.biography,
			urlProfile: `https://www.instagram.com/${data.user.username}`,
			urlImgProfile: data.user.profile_pic_url_hd,
			website: data.user.external_url,
			numberPosts: data.user.media.count,
			numberFollowers: data.user.followed_by.count,
			numberFollowing: data.user.follows.count,
			private: data.user.is_private,
			isOfficial: data.user.is_verified,
			posts: []
		};

		let hasNextPage = data.user.media.page_info.has_next_page;
		let idNextPage = data.user.media.page_info.end_cursor;

		function next(that) {
			const self = that;
			if (hasNextPage === false) {
				self.createFile();
			} else {
				setTimeout(() => {
					got(`https://instagram.com/${profileName}/?__a=1&max_id=${idNextPage}`, {json: true})
                        .then(request => {
	const newData = request.body;
	spinnerApi.text = `crawl posts with API : ${self.parsedData.posts.length}/${self.parsedData.numberPosts}`;
	hasNextPage = newData.user.media.page_info.has_next_page;
	idNextPage = newData.user.media.page_info.end_cursor;
	self.createPosts(newData.user.media.nodes, next);
});
				}, 1000);
			}
		}

		if (this.parsedData.private === true) {
			this.createFile();
		} else {
			this.createPosts(data.user.media.nodes, next);
		}
	},

	/**
	 * Get post for each name
	 * @param {Object} data
	 * @param {Callback} next
	 */
	createPosts(data, next) {
		data.forEach(post => {
			this.parsedData.posts.push({
				url: `https://www.instagram.com/p/${post.code}`,
				urlImage: post.display_src,
				width: post.dimensions.width,
				height: post.dimensions.height,
				numberLikes: post.likes.count,
				numberComments: post.comments.count,
				isVideo: post.is_video,
				multipleImage: (post.__typename === 'GraphSidecar'),
				tags: utils.getTags(post.caption),
				mentions: utils.getMentions(post.caption),
				description: post.caption,
				date: new Date(parseInt(post.date) * 1000)
			});
		});
		next(this);
	},

	/**
	 * Write file
	 */
	createFile() {
		utils.createFile(this.parsedData)
            .then(spinnerApi.succeed(chalk.green(`File created with success for profile ${this.parsedData.alias}`)))
            .catch(err => spinnerApi.fail(chalk.red(`Error : ${err.message}`)));
	}
};
