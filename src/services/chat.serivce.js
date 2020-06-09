const { Thread, Message, User } = require('../models');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');

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
