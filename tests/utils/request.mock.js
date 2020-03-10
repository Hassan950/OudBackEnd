const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (data) => {
  const req = {};
  req.body = data;
  return req;
};

module.exports = {
  mockRequest,
  mockResponse
}