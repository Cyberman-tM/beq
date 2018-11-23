var logger = require('winston');

module.exports = (args) => 
{
  logger.info(args[0]);
}
