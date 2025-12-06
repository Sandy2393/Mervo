// Global test setup
process.env.TZ = "UTC";
jest.setTimeout(30000);

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});
