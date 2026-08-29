import { Mixpanel } from "mixpanel-react-native";

import {
  compactProperties,
  identifyAnalyticsUser,
  initAnalytics,
  resetAnalytics,
  track,
} from "./analytics";

type MixpanelModule = {
  Mixpanel: jest.Mock;
  __mockInstance: {
    init: jest.Mock;
    track: jest.Mock;
    identify: jest.Mock;
    reset: jest.Mock;
    flush: jest.Mock;
    getPeople: jest.Mock;
    setLoggingEnabled: jest.Mock;
  };
  __mockPeople: { set: jest.Mock };
};

const mixpanelModule = jest.requireMock(
  "mixpanel-react-native",
) as MixpanelModule;

const originalToken = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;

beforeEach(() => {
  process.env.EXPO_PUBLIC_MIXPANEL_TOKEN = "test-token";
  mixpanelModule.__mockInstance.init.mockClear();
  mixpanelModule.__mockInstance.track.mockClear();
  mixpanelModule.__mockInstance.identify.mockClear();
  mixpanelModule.__mockInstance.reset.mockClear();
  mixpanelModule.__mockInstance.flush.mockClear();
  mixpanelModule.__mockPeople.set.mockClear();
});

afterEach(() => {
  process.env.EXPO_PUBLIC_MIXPANEL_TOKEN = originalToken;
});

describe("compactProperties", () => {
  it("omits null, undefined, and empty strings", () => {
    expect(
      compactProperties({
        stage: "building",
        skip: "",
        missing: null,
        absent: undefined,
        amount: 40,
        viaAI: true,
      }),
    ).toEqual({ stage: "building", amount: 40, viaAI: true });
  });

  it("returns an empty object when given nothing", () => {
    expect(compactProperties()).toEqual({});
  });
});

describe("Mixpanel tracking", () => {
  it("identifies the user before tracking sign_up_completed", async () => {
    await identifyAnalyticsUser("user_abc", { plan_type: "cadet" });
    track("sign_up_completed", { sign_up_method: "email" });
    await initAnalytics();
    await Promise.resolve();

    expect(Mixpanel).toHaveBeenCalledWith("test-token", false, false);
    expect(mixpanelModule.__mockInstance.identify).toHaveBeenCalledWith(
      "user_abc",
    );
    expect(mixpanelModule.__mockPeople.set).toHaveBeenCalledWith({
      plan_type: "cadet",
    });
    expect(mixpanelModule.__mockInstance.track).toHaveBeenCalledWith(
      "sign_up_completed",
      { sign_up_method: "email" },
    );
  });

  it("tracks the mission_created value moment with target platform and stage", async () => {
    await initAnalytics();
    track("mission_created", {
      app_target_platform: "ios",
      stage: "building",
      skip: "",
    });
    await initAnalytics();
    await Promise.resolve();

    expect(mixpanelModule.__mockInstance.track).toHaveBeenCalledWith(
      "mission_created",
      { app_target_platform: "ios", stage: "building" },
    );
    expect(mixpanelModule.__mockInstance.flush).toHaveBeenCalled();
  });

  it("resets identity on logout", async () => {
    await initAnalytics();
    resetAnalytics();
    await Promise.resolve();

    expect(mixpanelModule.__mockInstance.reset).toHaveBeenCalled();
  });
});
