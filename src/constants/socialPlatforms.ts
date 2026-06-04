/** Social platforms users can link in Marketing blueprints. */
export type SocialPlatformId =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "twitter"
  | "youtube"
  | "tiktok";

export type SocialLinkEntry = {
  enabled: boolean;
  handle: string;
};

export type SocialLinksMap = Record<SocialPlatformId, SocialLinkEntry>;

export type SocialPlatformMeta = {
  id: SocialPlatformId;
  name: string;
  /** Static URL prefix shown beside the handle input. */
  baseUrl: string;
  /** Brand accent for the mini platform icon. */
  brandColor: string;
  placeholder: string;
};

export const SOCIAL_PLATFORMS: SocialPlatformMeta[] = [
  {
    id: "facebook",
    name: "Facebook",
    baseUrl: "facebook.com/",
    brandColor: "#1877F2",
    placeholder: "yourpage",
  },
  {
    id: "instagram",
    name: "Instagram",
    baseUrl: "instagram.com/",
    brandColor: "#E4405F",
    placeholder: "yourhandle",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    baseUrl: "linkedin.com/in/",
    brandColor: "#0A66C2",
    placeholder: "your-profile",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    baseUrl: "x.com/",
    brandColor: "#1DA1F2",
    placeholder: "yourhandle",
  },
  {
    id: "youtube",
    name: "YouTube",
    baseUrl: "youtube.com/@",
    brandColor: "#FF0000",
    placeholder: "yourchannel",
  },
  {
    id: "tiktok",
    name: "TikTok",
    baseUrl: "tiktok.com/@",
    brandColor: "#010101",
    placeholder: "yourhandle",
  },
];

export const SOCIAL_LINKS_FIELD_KEY = "socialLinks";

export function emptySocialLinks(): SocialLinksMap {
  return Object.fromEntries(
    SOCIAL_PLATFORMS.map((p) => [p.id, { enabled: false, handle: "" }]),
  ) as SocialLinksMap;
}
