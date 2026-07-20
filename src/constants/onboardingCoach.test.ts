import { COACH } from "./onboardingCoach";

it("has an entry for every onboarding step 0-6", () => {
  for (let step = 0; step <= 6; step++) {
    expect(COACH[step]).toBeDefined();
    expect(typeof COACH[step].line).toBe("string");
    expect(COACH[step].line.length).toBeGreaterThan(0);
  }
});

it("uses the welcoming pose and naming prompt on step 0", () => {
  expect(COACH[0].pose).toBe("hello");
  expect(COACH[0].line).toMatch(/called/i);
});

it("uses an approving pose on the confirm step", () => {
  expect(COACH[6].pose).toBe("thumbsup");
});
