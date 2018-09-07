var blacklist = require('metro-bundler').createBlacklist;

var config = {
  getBlacklistRE(platform) {
    return blacklist([
      /src\/backend\/.*/
    ]);
  }
};

module.exports = config;
