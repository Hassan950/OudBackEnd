const { chatService } = require('../../../src/services');
const { Thread, User } = require('../../../src/models');
const moment = require('moment');
const requestMocks = require('../../utils/request.mock');
const mockingoose = require('mockingoose').default;
const httpStatus = require('http-status');

describe('Chat Service', () => {
  let thread;
  let user;
  let query;
  beforeEach(() => {
    query = { limit: 20, offset: 0 };
    user = new User({
      displayName: 'Hassan'
    }).toJSON();
    to = new User({
      displayName: 'Another One'
    }).toJSON();
    thread = new Thread({
      from: user._id,
      to: to._id,
      messages: [{ author: user._id, message: 'Hello, Test!' }],
      read: false
    }).toJSON();
  });
  describe('getChat', () => {
    it('should return object that has the threads and total number of them', async () => {
      mockingoose(Thread)
        .toReturn([thread], 'find')
        .toReturn(1, 'countDocuments');
      const result = await chatService.getChat(user._id, query);
      expect(result.data[0].toJSON()).toMatchObject(thread);
      expect(result.total).toBe(1);
    });
  });

  describe('getThread', () => {
    it('should return Not found if no thread is associated with given threadId & userId', async () => {
      mockingoose(Thread)
        .toReturn(undefined, 'findOne')
        .toReturn([], 'aggregate');
      const result = await chatService.getThread(user._id, thread._id, query);
      expect(result.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it('should return the thread with messages in paging object', async () => {
      mockingoose(Thread)
        .toReturn(thread, 'findOne')
        .toReturn([{ total: 1 }], 'aggregate');
      const result = await chatService.getThread(user._id, thread._id, query);
      thread.messages = {
        items: thread.messages,
        total: 1,
        offset: query.offset,
        limit: query.limit
      };
      expect(result).toMatchObject(thread);
    });

    it('should return the thread with messages in paging object and set read to true if the user is not the author', async () => {
      mockingoose(Thread)
        .toReturn(thread, 'findOne')
        .toReturn([{ total: 1 }], 'aggregate')
        .toReturn(undefined, 'findOneAndUpdate');
      const result = await chatService.getThread(to._id, thread._id, query);
      thread.messages = {
        items: thread.messages,
        total: 1,
        offset: query.offset,
        limit: query.limit
      };
      thread.read = true;
      expect(result).toMatchObject(thread);
    });
  });

  describe('sendMessage', () => {
    it('should return true if thread is already found after updating it', async () => {
      mockingoose(Thread)
        .toReturn(thread, 'findOneAndUpdate')
      const result = await chatService.sendMessage(user._id, to._id, 'Hello!');
      expect(result).toBe(true);
    });

    it('if thread is not already found, return not found if there is no user with that id', async () => {
      mockingoose(Thread).toReturn(undefined, 'findOneAndUpdate')
      mockingoose(User)
        .toReturn(undefined, 'findOne');
      const result = await chatService.sendMessage(user._id, to._id, 'Hello!');
      expect(result.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it('should add the message to the newly created thread and return true', async () => {
      mockingoose(User).toReturn(undefined, 'findOne');
      mockingoose(User).toReturn(to, 'findOne');
      const result = await chatService.sendMessage(user._id, to._id, 'Hello!');
      expect(result).toBe(true);
    });
  });

  describe('deleteMessage', () => {
    it('should return not found if there is not a message with that id in the given thread', async () => {
      mockingoose(Thread)
        .toReturn(undefined, 'findOneAndUpdate')
      const result = await chatService.deleteMessage(user._id, to._id, 'messageId');
      expect(result.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it('Should return true if message is deleted successfully', async () => {
      mockingoose(Thread).toReturn(thread, 'findOneAndUpdate')
      const result = await chatService.deleteMessage(user._id, to._id, 'messageId');
      expect(result).toBe(true);
    });
  });
});
