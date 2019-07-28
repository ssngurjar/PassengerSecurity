require 'coffee-script/register'
module.exports = require './lib/railway.coffee'
var railway = require('railway-api');
railway.setApikey('eqs76rqu4u');
railway.liveTrainStatus('12903', function (err, res) {});
