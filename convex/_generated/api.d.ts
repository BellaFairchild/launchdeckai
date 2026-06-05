/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as aiMock from "../aiMock.js";
import type * as assets from "../assets.js";
import type * as blueprints from "../blueprints.js";
import type * as broadcasts from "../broadcasts.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as milestones from "../milestones.js";
import type * as missions from "../missions.js";
import type * as resources from "../resources.js";
import type * as subscriptions from "../subscriptions.js";
import type * as templates from "../templates.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  aiMock: typeof aiMock;
  assets: typeof assets;
  blueprints: typeof blueprints;
  broadcasts: typeof broadcasts;
  helpers: typeof helpers;
  http: typeof http;
  milestones: typeof milestones;
  missions: typeof missions;
  resources: typeof resources;
  subscriptions: typeof subscriptions;
  templates: typeof templates;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
