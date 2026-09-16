const mockCreateMessage = jest.fn();

jest.mock("@anthropic-ai/sdk", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: { create: mockCreateMessage },
  })),
}));

import { copilotReply, generateAsset } from "./ai";

type CopilotAction = {
  _handler: (
    ctx: {
      runQuery: () => Promise<{ ok: true }>;
      runMutation: () => Promise<null>;
    },
    args: {
      mode?: "standard" | "powerful";
      mission: {
        appName: string;
        oneLiner: string;
        targetAudience: string;
        platform: string;
      };
      context: {
        readinessScore: number;
        incompleteMilestones: string[];
        blueprintProgress: number;
        signalsReady: number;
        launchLabel: string;
      };
      messages: { role: "user" | "assistant"; content: string }[];
    },
  ) => Promise<{ content: string; mock: boolean }>;
};

type FoundryAction = {
  _handler: (
    ctx: { runQuery: () => Promise<{ ok: false; mock: true }> },
    args: {
      tool: string;
      toolLabel: string;
      mission: {
        appName: string;
        oneLiner: string;
        targetAudience: string;
        platform: string;
      };
    },
  ) => Promise<{ content: string; mock: boolean }>;
};

const baseArgs = {
  mode: "powerful" as const,
  mission: {
    appName: "LaunchDeckAI",
    oneLiner: "Launch without the scramble",
    targetAudience: "App creators",
    platform: "ios",
  },
  context: {
    readinessScore: 50,
    incompleteMilestones: [],
    blueprintProgress: 50,
    signalsReady: 8,
    launchLabel: "Next week",
  },
};

describe("copilotReply", () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreateMessage.mockResolvedValue({
      content: [{ type: "text", text: "A focused next step." }],
    });
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    mockCreateMessage.mockReset();
  });

  it("sends a user-first history after trimming a long conversation", async () => {
    const action = copilotReply as unknown as CopilotAction;
    const messages = Array.from({ length: 41 }, (_, index) => ({
      role: index % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `turn ${index}`,
    }));

    await action._handler(
      {
        runQuery: async () => ({ ok: true }),
        runMutation: async () => null,
      },
      { ...baseArgs, messages },
    );

    const request = mockCreateMessage.mock.calls[0]?.[0] as {
      messages: { role: string }[];
    };
    expect(request.messages[0]?.role).toBe("user");
  });

  it("does not invoke Anthropic for an unauthorized Foundry request", async () => {
    const action = generateAsset as unknown as FoundryAction;

    const result = await action._handler(
      {
        runQuery: async () => ({ ok: false, mock: true }),
      },
      {
        tool: "social_blast",
        toolLabel: "Social blast",
        mission: baseArgs.mission,
      },
    );

    expect(result.mock).toBe(true);
    expect(mockCreateMessage).not.toHaveBeenCalled();
  });

  it("does not invoke Anthropic for an unauthorized Copilot request", async () => {
    const action = copilotReply as unknown as CopilotAction;

    const result = await action._handler(
      {
        runQuery: async () => ({ ok: false, mock: true }),
        runMutation: async () => null,
      },
      {
        ...baseArgs,
        messages: [{ role: "user", content: "What should I do next?" }],
      },
    );

    expect(result.mock).toBe(true);
    expect(mockCreateMessage).not.toHaveBeenCalled();
  });
});
