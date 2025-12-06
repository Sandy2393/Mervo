import React from "react";
import { View, Text } from "react-native";

type Props = { pending: number };

export default function OfflineStatusIndicator({ pending }: Props) {
  const color = pending > 0 ? "#f59e0b" : "#22c55e";
  const label = pending > 0 ? `${pending} queued` : "Synced";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ color }}>{label}</Text>
    </View>
  );
}