const { PlayHistory } = require('../models');


/**
 * Get History with the given userId and ops
 * 
 * @function
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId User ID
 * @param {Object} [ops] Options Object
 * @param {number} [ops.limit] The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50
 * @param {number} [ops.after] A Unix timestamp in milliseconds. Returns all items after (but not including) this cursor position. If after is specified, before must not be specified
 * @param {number} [ops.before] A Unix timestamp in milliseconds. Returns all items before (but not including) this cursor position. If before is specified, after must not be specified
 * @returns {Array<Document>} history
 * @summary Get History 
 */
const getHistory = async (userId, ops = {
  limit: 20,
  after: undefined,
  before: undefined
}) => {
  const history = PlayHistory.find({ user: userId })
    .limit(ops.limit);

  if (ops.after)
    history.gt('playedAt', ops.after);
  else if (ops.before)
    history.lt('playedAt', ops.before);

  await history;

  return history;
};


/**
 * Add Track to history
 * 
 * @function
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId User ID
 * @param {String} trackId Track ID
 * @param {Object} [context] context Object
 * @param {String} [context.type] context type enum = ['album', 'artist', 'playlist', 'unknown'] 
 * (default = 'unknown')
 * @param {String} [context.id] context ID
 * @throws {MongooseError}
 * @returns {Document} history
 * @summary Add Track to history
 */
const addToHistory = async (userId, trackId, context = {
  type: 'unknown',
  id: undefined
}) => {
  const history = await PlayHistory.create({
    user: userId,
    track: trackId,
    context: context
  });

  return history;
};

module.exports = { getHistory, addToHistory };