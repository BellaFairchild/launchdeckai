import type { Asset } from "@/types";

const mockFile = jest.fn();
const mockGenerateAsync = jest.fn(async () => "BASE64ZIP");
jest.mock("jszip", () =>
  jest.fn().mockImplementation(() => ({ file: mockFile, generateAsync: mockGenerateAsync })),
);
jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  EncodingType: { Base64: "base64" },
  writeAsStringAsync: jest.fn(async () => undefined),
}));
const mockShareAsync = jest.fn(async () => undefined);
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: (...a: unknown[]) => mockShareAsync(...a),
}));
jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));

import { exportSignalPack } from "./exportSignalPack";
import { SIGNAL_TEMPLATES } from "@/constants/signalTemplates";

function asset(over: Partial<Asset>): Asset {
  return {
    id: "a1", type: "signal_asset", title: "t", content: "body",
    status: "flight_ready", category: "social", updatedAt: 0, ...over,
  };
}

beforeEach(() => jest.clearAllMocks());

it("zips every pack file and shares the archive", async () => {
  await exportSignalPack([asset({ signalId: SIGNAL_TEMPLATES[0].id })], Date.now(), "FocusFlow");
  // csv + json + readme + 1 flight-ready txt = 4 entries
  expect(mockFile).toHaveBeenCalledTimes(4);
  expect(mockGenerateAsync).toHaveBeenCalledWith({ type: "base64" });
  expect(mockShareAsync).toHaveBeenCalledTimes(1);
  const FileSystem = require("expo-file-system/legacy");
  expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
    expect.stringContaining("FocusFlow-signal-pack.zip"),
    "BASE64ZIP",
    { encoding: "base64" },
  );
});

it("returns the ids of flight-ready assets to flip to exported", async () => {
  const ids = await exportSignalPack(
    [asset({ id: "x", signalId: SIGNAL_TEMPLATES[0].id }), asset({ id: "y", status: "in_prep" })],
    Date.now(),
    "App",
  );
  expect(ids).toEqual(["x"]);
});
