const { Thread, User } = require('../models');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');


/**
 * A method that gets the messages' threads of the user sorted from most frequent modified to least and total number of the threads
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get messages' threads
 * @param {String} userId - The id of the user
 * @param {Object} query - Query object has the limit and offset
 * @returns {Object} object has the thread with total number of the threads
 */
exports.getChat = async (userId, query) => {
  let data = Thread.find({ $or: [{ from: userId }, { to: userId }] })
    .slice('messages', 1)
    .populate({
      path: 'from',
      select: 'displayName'
    })
    .populate({
      path: 'to',
      select: 'displayName'
    })
    .sort({
      updatedAt: -1
    })
    .skip(query.offset)
    .limit(query.limit)
    .exec();
  let total = Thread.countDocuments({
    $or: [{ from: userId }, { to: userId }]
  }).exec();
  [data, total] = await Promise.all([data, total]);
  return { data, total };
};


/**
 * A method that gets a specific thread of the user with its messages
 * wrapped in paging object sorted from most frequent one to least.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get messages of a thread
 * @param {String} userId - The id of the user
 * @param {String} threadId - The id of the thread
 * @param {Object} query - Query object has the limit and offset
 * @returns {Object} object has the thread with messages populated wrapped in paging object
 */
exports.getThread = async (userId, threadId, query) => {
  let data = Thread.findOne({
    $and: [{ _id: threadId }, { $or: [{ from: userId }, { to: userId }] }]
  })
    .populate({
      path: 'from',
      select: 'displayName'
    })
    .populate({
      path: 'to',
      select: 'displayName'
    })
    .slice('messages', [query.offset, query.limit + query.offset])
    .lean({ defaults: true })
    .exec();
  let total = Thread.aggregate()
    .match({
      $and: [
        { _id: mongoose.Types.ObjectId(threadId) },
        { $or: [{ from: userId }, { to: userId }] }
      ]
    })
    .project({
      total: { $size: '$messages' }
    })
    .exec();

  [data, total] = await Promise.all([data, total]);
  if (!data)
    return new AppError(
      'The requested resource cannot be found.',
      httpStatus.NOT_FOUND
    );

  if (
    String(data.messages[0].author) !== String(userId) &&
    data.read !== true
  ) {
    data.read = true;
    await Thread.findByIdAndUpdate(
      threadId,
      {
        $set: {
          read: true
        }
      },
      {
        timestamps: false
      }
    );
  }
  data.messages = {
    items: data.messages,
    total: total[0].total,
    offset: query.offset,
    limit: query.limit
  };
  return data;
};


/**
 * A method that sends a message to a specific thread of the user.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Send Message to a Thread
 * @param {String} userId - The id of the user
 * @param {String} recId - The id of the recipient
 * @param {String} message - The content of the message
 * @returns {true} if done successfully
 * @returns {AppError} if there is no user with the given recId 
 */
exports.sendMessage = async (userId, recId, message) => {
  message = {
    message: message,
    author: userId
  };
  const thread = await Thread.findOneAndUpdate(
    {
      $or: [
        {
          $and: [
            {
              from: userId
            },
            {
              to: recId
            }
          ]
        },
        {
          $and: [
            {
              to: userId
            },
            {
              from: recId
            }
          ]
        }
      ]
    },
    {
      $push: {
        messages: {
          $each: [message],
          $position: 0
        }
      },
      $set: {
        read: false
      }
    }
  );
  if (thread) return true;

  const user = await User.findById(recId).lean();
  if (!user) return new AppError('User is not found!', httpStatus.NOT_FOUND);

  await Thread.findOneAndUpdate(
    {
      from: userId,
      to: recId
    },
    {
      $push: {
        messages: message
      }
    },
    {
      upsert: true
    }
  );
  return true;
};


/**
 * A method that deletes a specific message from a thread
 *
 * @function
 * @author Hassan Mohamed
 * @summary Delete Message From a Thread
 * @param {String} userId - The id of the user
 * @param {String} recId - The id of the recipient
 * @param {String} messageId - The id of the message
 * @returns {true} if done successfully
 * @returns {AppError} if there is no thread or no message with the given ids
 */
exports.deleteMessage = async (userId, threadId, messageId) => {
  const thread = await Thread.findOneAndUpdate(
    { _id: threadId, 'messages._id': messageId, 'messages.author': userId },
    {
      $pull: {
        messages: { _id: messageId }
      }
    },
    {
      timestamps: false
    }
  );
  if (!thread)
    return new AppError('Message is not found', httpStatus.NOT_FOUND);
  return true;
};
