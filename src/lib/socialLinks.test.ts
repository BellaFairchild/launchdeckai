import { emptySocialLinks } from "@/constants/socialPlatforms";
import {
    buildSocialUrl,
    enabledSocialCount,
    parseSocialLinks,
    serializeSocialLinks,
} from "@/lib/socialLinks";

describe("socialLinks", () => {
  it("parses stored JSON and falls back safely", () => {
    const raw = JSON.stringify({
      twitter: { enabled: true, handle: "launchdeck" },
      instagram: { enabled: false, handle: "old" },
    });
    const links = parseSocialLinks(raw);
    expect(links.twitter).toEqual({ enabled: true, handle: "launchdeck" });
    expect(links.instagram.enabled).toBe(false);
    expect(links.facebook.enabled).toBe(false);
  });

  it("returns defaults for invalid JSON", () => {
    expect(parseSocialLinks("{bad")).toEqual(emptySocialLinks());
  });

  it("builds platform URLs from handles", () => {
    expect(buildSocialUrl("twitter", "@launchdeck")).toBe(
      "https://x.com/launchdeck",
    );
    expect(buildSocialUrl("youtube", "mychannel")).toBe(
      "https://youtube.com/@mychannel",
    );
    expect(buildSocialUrl("tiktok", "@creator")).toBe(
      "https://tiktok.com/@creator",
    );
    expect(buildSocialUrl("twitter", "  ")).toBeNull();
  });

  it("counts enabled channels with handles", () => {
    const links = emptySocialLinks();
    links.twitter = { enabled: true, handle: "a" };
    links.facebook = { enabled: true, handle: "" };
    links.linkedin = { enabled: false, handle: "b" };
    expect(enabledSocialCount(links)).toBe(1);
  });

  it("round-trips through serialize", () => {
    const links = emptySocialLinks();
    links.instagram = { enabled: true, handle: "studio" };
    const restored = parseSocialLinks(serializeSocialLinks(links));
    expect(restored.instagram).toEqual({ enabled: true, handle: "studio" });
  });
});
