var gaiajs = require('gaiajs');

module.exports = function(hooks) {
  hooks = hooks || {};
  return new gaiajs(__dirname, hooks).init();
}