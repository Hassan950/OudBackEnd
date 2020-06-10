const { chatController } = require('../../../src/controllers');
const { chatService } = require('../../../src/services');
const AppError = require('../../../src/utils/AppError');
const requestMocks = require('../../utils/request.mock');
const httpStatus = require('http-status');

describe('Chat Controller', () => {
  let req;
  let res;
  let next;
  let json;
  beforeEach(() => {
    req = {
      params: { id: 'SomeOtherId' },
      query: { limit: 20, offset: 0 },
      body: {},
      user: { _id: 'SomeId' }
    };
    res = requestMocks.mockResponse();
    json = jest.fn();
    res.status = jest.fn().mockReturnValue({
      json: json
    });
    res.sendStatus = jest.fn();
    next = jest.fn();
  });
  describe('getChat', () => {
    it('should send json file if everything went ok', async () => {
      const result = { data: 'someReturnValue', total: 2 };
      chatService.getChat = jest.fn().mockResolvedValue(result);
      await chatController.getChat(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
      expect(json.mock.calls[0][0]).toMatchObject({
        items: result.data,
        offset: req.query.offset,
        limit: req.query.limit,
        total: result.total
      });
    });
  });

  describe('getThread', () => {
    it('should return an error if chatService has returned an AppError instance', async () => {
      chatService.getThread = jest
        .fn()
        .mockResolvedValue(new AppError('An Error', httpStatus.NOT_FOUND));
      await chatController.getThread(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it('should send json file if everything went ok', async () => {
      const result = 'someReturnValue';
      chatService.getThread = jest.fn().mockResolvedValue(result);
      await chatController.getThread(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
      expect(json.mock.calls[0][0]).toMatchObject({ result });
    });
  });

  describe('sendMessage', () => {
    it('should return an error if chatService has returned an AppError instance', async () => {
      chatService.sendMessage = jest
        .fn()
        .mockResolvedValue(new AppError('An Error', httpStatus.NOT_FOUND));
      await chatController.sendMessage(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it('should send httpStatus.CREATED if everything went ok', async () => {
      chatService.sendMessage = jest.fn().mockResolvedValue(true);
      await chatController.sendMessage(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(httpStatus.CREATED);
    });
  });

  describe('deleteMessage', () => {
    it('should return an error if chatService has returned an AppError instance', async () => {
      chatService.deleteMessage = jest
        .fn()
        .mockResolvedValue(new AppError('An Error', httpStatus.NOT_FOUND));
      await chatController.deleteMessage(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it('should send httpStatus.NO_CONTENT if everything went ok', async () => {
      chatService.deleteMessage = jest.fn().mockResolvedValue(true);
      await chatController.deleteMessage(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });
  });
});
