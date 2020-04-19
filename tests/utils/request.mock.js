const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (data) => {
  const req = {};
  req.body = data;
  req.protocol = 'http';
  req.get = jest.fn().mockImplementation((name) => { return name; });
  req.query = {};
  return req;
};

module.exports = {
  mockRequest,
  mockResponse
}