import React from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useClerk } from "@clerk/clerk-expo";

import { api } from "@cvx/_generated/api";
import type { Id, Doc } from "@cvx/_generated/dataModel";
import { authEnabled } from "@/lib/auth";
import { configurePurchases } from "@/lib/purchases";
import { setAnalyticsUser } from "@/lib/analytics";
import { useUIStore } from "@/store/ui";
import { useMissionStore } from "@/store/mission";
import { useSavedResourcesStore } from "@/store/savedResources";
import { reconcileBroadcastReminders } from "@/lib/notifications";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import { SIGNAL_TEMPLATES } from "@/constants/signalTemplates";
import type { Mission, Milestone, Blueprint, Asset, BlueprintSection, Broadcast } from "@/types";

function mapMission(d: Doc<"missions">): Mission {
  return {
    id: d._id,
    appName: d.appName,
    appDescription: d.appDescription,
    oneLiner: d.oneLiner,
    targetAudience: d.targetAudience,
    platform: d.platform,
    launchDate: d.launchDate,
    stage: d.stage,
    status: d.status,
    readinessScore: d.readinessScore,
  };
}

function mapMilestone(d: Doc<"milestones">): Milestone {
  return {
    id: d._id,
    title: d.title,
    description: d.description,
    category: d.category as Milestone["category"],
    completed: d.completed,
    fuelReward: d.fuelReward,
    requiredPlan: d.requiredPlan,
    isLocked: d.isLocked,
  };
}

function mapAsset(d: Doc<"assets">): Asset {
  return {
    id: d._id,
    type: d.type as Asset["type"],
    title: d.title,
    content: d.content,
    status: d.status,
    category: d.category as Asset["category"],
    signalId: d.signalId,
    signalLabel: d.signalLabel,
    signalPhase: d.signalPhase,
    updatedAt: d._creationTime,
  };
}

function mapBroadcast(d: Doc<"broadcasts">): Broadcast {
  return {
    signalId: d.signalId,
    destinationUrl: d.destinationUrl,
    scheduledAt: d.scheduledAt,
  };
}

function mapBlueprints(docs: Doc<"blueprints">[]): Record<BlueprintSection, Blueprint> {
  const out = {} as Record<BlueprintSection, Blueprint>;
  for (const section of BLUEPRINT_SECTIONS) {
    out[section.id] = { section: section.id, fields: {}, completionStatus: 0 };
  }
  for (const d of docs) {
    out[d.section as BlueprintSection] = {
      section: d.section as BlueprintSection,
      fields: d.fields,
      completionStatus: d.completionStatus,
    };
  }
  return out;
}

function DataSyncInner() {
  const { isAuthenticated } = useConvexAuth();
  const clerk = useClerk();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const data = useQuery(api.missions.getLaunchData, {});

  const completeMilestone = useMutation(api.milestones.complete);
  const saveBlueprint = useMutation(api.blueprints.save);
  const updateStatus = useMutation(api.assets.updateStatus);
  const createFoundryAsset = useMutation(api.assets.createFoundryAsset);
  const scheduleBroadcast = useMutation(api.broadcasts.schedule);
  const cancelBroadcast = useMutation(api.broadcasts.cancel);
  const setPlan = useMutation(api.users.setPlan);
  const savedIds = useQuery(api.resources.listSaved);
  const toggleSavedResource = useMutation(api.resources.toggleSaved);

  // Expose Clerk sign-out to the UI store (used by the drawer + settings).
  React.useEffect(() => {
    useUIStore.setState({ signOut: () => void clerk.signOut() });
  }, [clerk]);

  // Ensure the Convex user record exists on first sign-in.
  React.useEffect(() => {
    if (isAuthenticated) getOrCreateUser().catch(() => {});
  }, [isAuthenticated, getOrCreateUser]);

  // Inject / clear the Convex mutation adapter.
  React.useEffect(() => {
    if (!isAuthenticated) {
      useMissionStore.getState().setConvex(null);
      useUIStore.getState().clearServerState();
      return;
    }
    useMissionStore.getState().setConvex({
      completeMilestone: (id) => {
        void completeMilestone({ milestoneId: id as Id<"milestones"> });
      },
      saveBlueprint: (section, fields, completionStatus) => {
        void saveBlueprint({ section, fields, completionStatus });
      },
      updateAssetStatus: (id, status) => {
        void updateStatus({ assetId: id as Id<"assets">, status });
      },
      createFoundryAsset: async (a) => {
        await createFoundryAsset({
          tool: a.tool,
          assetType: a.assetType,
          category: a.category,
          title: a.title,
          content: a.content,
          signalId: a.signalId,
          signalLabel: a.signalLabel,
          signalPhase: a.signalPhase,
        });
      },
      scheduleBroadcast: (plan) => {
        void scheduleBroadcast({
          signalId: plan.signalId,
          destinationUrl: plan.destinationUrl,
          scheduledAt: plan.scheduledAt,
        });
      },
      cancelBroadcast: (signalId) => {
        void cancelBroadcast({ signalId });
      },
    });
  }, [isAuthenticated, completeMilestone, saveBlueprint, updateStatus, createFoundryAsset, scheduleBroadcast, cancelBroadcast]);

  // Hydrate stores from the live Convex query.
  React.useEffect(() => {
    if (!isAuthenticated || !data) return;
    if (data.user) {
      useUIStore.getState().setServerState({
        plan: data.user.plan,
        fuel: data.user.fuelBalance,
        streak: data.user.currentStreak,
        convexSetPlan: (plan) => {
          void setPlan({ plan });
        },
      });
      // Tie RevenueCat purchases + analytics to the Clerk user.
      configurePurchases(data.user.clerkId);
      setAnalyticsUser(data.user.clerkId);
    }
    if (data.mission) {
      useMissionStore.getState().hydrate({
        mission: mapMission(data.mission),
        milestones: data.milestones.map(mapMilestone),
        blueprints: mapBlueprints(data.blueprints),
        assets: data.assets.map(mapAsset),
        broadcasts: data.broadcasts.map(mapBroadcast),
      });
      void reconcileBroadcastReminders(
        data.broadcasts.map(mapBroadcast),
        (signalId) => {
          const t = SIGNAL_TEMPLATES.find((s) => s.id === signalId);
          return t ? { label: t.label, platform: t.platform } : undefined;
        },
      );
    }
  }, [isAuthenticated, data, setPlan]);

  // Hydrate saved resources from Convex (works in demo mode — listSaved returns []).
  React.useEffect(() => {
    if (savedIds) useSavedResourcesStore.getState().hydrate(savedIds);
  }, [savedIds]);

  // Wire the Convex toggle into the saved resources store.
  React.useEffect(() => {
    useSavedResourcesStore.getState().setConvexToggle((id) => {
      void toggleSavedResource({ resourceId: id });
    });
    return () => useSavedResourcesStore.getState().setConvexToggle(null);
  }, [toggleSavedResource]);

  return null;
}

/** Bridges Convex ↔ the Zustand stores when auth is enabled; inert otherwise. */
export function DataSync() {
  if (!authEnabled) return null;
  return <DataSyncInner />;
}
