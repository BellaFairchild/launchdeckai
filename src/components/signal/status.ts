import type { SignalStatus } from "@/components/ui/SignalBars";
import type { Asset } from "@/types";

/**
 * A signal's readiness is derived from its linked Cargo Bay asset, never set
 * manually (Docs/07). Shared by the Signal Deck list and calendar views.
 */
export function signalStatus(signalId: string, assets: Asset[]): SignalStatus {
  const linked = assets.find((a) => a.signalId === signalId);
  if (!linked) return "not_loaded";
  if (linked.status === "flight_ready" || linked.status === "exported") {
    return "flight_ready";
  }
  return "in_prep";
}
