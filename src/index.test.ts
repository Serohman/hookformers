import {greet} from "./index";

describe("greet", () => {
  test("should return correct message", () => {
    expect(greet("Bob")).toBe("Hello, Bob!");
  });
});
