require('../../modules/es.set.constructor');
require('../../modules/esnext.set.intersection');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Set', 'intersection');
