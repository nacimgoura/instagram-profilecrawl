const got = require('got');
const ora = require('ora');
const chalk = require('chalk');
const utils = require('./utils');

const spinnerApi = ora('Init Api!');

module.exports = {
  /**
   * For each name, load profile
   * @param {Array} listProfileName
   * @param options
   */
  start(listProfileName, options) {
    this.options = options;
    spinnerApi.start();
    listProfileName.forEach(profileName => {
      got(`https://instagram.com/${profileName}/?__a=1`, { json: true }).then(
        data => this.parseData(profileName, data.body)
      );
    });
  },

  /**
   * Parse data for each name
   * @param {String} profileName
   * @param {Object} data
   */
  parseData(profileName, body) {
    const { user } = body.graphql;
    const userId = user.id;
    this.parsedData = {
      id: userId,
      alias: user.username,
      username: user.full_name,
      descriptionProfile: user.biography,
      urlProfile: `https://www.instagram.com/${user.username}`,
      urlImgProfile: user.profile_pic_url_hd,
      website: user.external_url,
      numberPosts: user.edge_owner_to_timeline_media.count,
      numberFollowers: user.edge_followed_by.count,
      numberFollowing: user.edge_follow.count,
      private: user.is_private,
      isOfficial: user.is_verified,
      posts: [],
    };

    let hasNextPage = user.edge_owner_to_timeline_media.page_info.has_next_page;
    let idNextPage = user.edge_owner_to_timeline_media.page_info.end_cursor;

    function next(self) {
      if (hasNextPage === false) {
        self.createFile();
      } else {
        setTimeout(() => {
          got(
            `https://instagram.com/graphql/query/?query_id=17888483320059182&id=${userId}&first=12&after=${idNextPage}`,
            { json: true }
          ).then(request => {
            const { user } = request.body.data;
            spinnerApi.text = `crawl posts with API : ${
              self.parsedData.posts.length
            }/${self.parsedData.numberPosts}`;
            hasNextPage =
              user.edge_owner_to_timeline_media.page_info.has_next_page;
            idNextPage = user.edge_owner_to_timeline_media.page_info.end_cursor;
            self.createPosts(user.edge_owner_to_timeline_media.edges, next);
          });
        }, 1000);
      }
    }

    if (this.parsedData.private === true) {
      this.createFile();
    } else {
      this.createPosts(user.edge_owner_to_timeline_media.edges, next);
    }
  },

  /**
   * Get post for each name
   * @param {Object} data
   * @param {Callback} next
   */
  createPosts(data, next) {
    data.forEach(item => {
      const post = item.node;
      this.parsedData.posts.push({
        url: `https://www.instagram.com/p/${post.shortcode}`,
        urlImage: post.display_url,
        width: post.dimensions.width,
        height: post.dimensions.height,
        numberLikes: post.edge_media_preview_like.count,
        numberComments: post.edge_media_to_comment.count,
        isVideo: post.is_video,
        multipleImage: post.__typename === 'GraphSidecar',
        tags: post.edge_media_to_caption.edges.length
          ? utils.getTags(post.edge_media_to_caption.edges[0].node.text)
          : [],
        mentions: post.edge_media_to_caption.edges.length
          ? utils.getMentions(post.edge_media_to_caption.edges[0].node.text)
          : [],
        description: post.edge_media_to_caption.edges.length
          ? post.edge_media_to_caption.edges[0].node.text
          : [],
        date: new Date(parseInt(post.taken_at_timestamp) * 1000),
      });
    });
    next(this);
  },

  /**
   * Write file
   */
  createFile() {
    utils
      .createFile(this.parsedData, this.options)
      .then(
        spinnerApi.succeed(
          chalk.green(
            `File created with success for profile ${this.parsedData.alias}`
          )
        )
      )
      .catch(err => spinnerApi.fail(chalk.red(`Error : ${err.message}`)));
  },
};
