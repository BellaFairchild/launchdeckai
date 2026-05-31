import React, { useState } from "react";
import { Linking } from "react-native";

import { ScrollView, View, Text, TextInput, Pressable } from "@/tw";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { LAUNCH_RESOURCES, RESOURCE_CATEGORIES } from "@/constants/launchResources";

export default function LaunchLibraryModal() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = LAUNCH_RESOURCES.filter((r) => {
    const matchesCat = category === "All" || r.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <View className="flex-1 bg-bg-deep">
      <View className="gap-3 px-5 pt-4">
        <Text className="font-display text-2xl font-bold text-text-primary">Launch Library</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search resources…"
          placeholderTextColor="#64748B"
          className="rounded-full border border-border-med bg-bg-card px-4 py-2.5 font-body text-base text-text-primary"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-1">
          {RESOURCE_CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3 py-1.5",
                category === c ? "border-brand-teal bg-brand-teal/15" : "border-border-med bg-bg-surface",
              )}
            >
              <Text className={cn("font-body text-xs", category === c ? "text-brand-teal" : "text-text-secondary")}>
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerClassName="gap-3 px-5 py-4 pb-12">
        {filtered.length === 0 ? (
          <EmptyState icon="🔭" title="No resources found" message="Try a different search or category." />
        ) : (
          filtered.map((r) => (
            <Card key={r.id} variant="glass">
              <Text className="font-display text-base font-bold text-text-primary">{r.title}</Text>
              <Text className="mt-0.5 font-body text-sm text-text-secondary">{r.description}</Text>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                  {r.category}
                </Text>
                <Button label="Open →" size="sm" variant="ghost" onPress={() => Linking.openURL(r.url)} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
