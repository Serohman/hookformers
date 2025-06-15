import * as publicApi from "./index";

describe("Public API", () => {
  it("should not change without a deliberate update", () => {
    expect(publicApi).toMatchSnapshot();
  });
});
