import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getEarnings } from "@app-id/sdk-js";
import { EarningsResponse } from "@app-id/sdk-js/src/types";

export default function Earnings() {
  const [data, setData] = useState<EarningsResponse>({ total: 0, currency: "USD", items: [] });

  useEffect(() => {
    const run = async () => {
      const res = await getEarnings({ token: "TODO-token" });
      setData(res);
    };
    run();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Earnings</Text>
      <Text style={{ marginBottom: 12 }}>
        Total: {data.currency} {data.total.toFixed(2)}
      </Text>
      <FlatList
        data={data.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#e5e7eb" }}>
            <Text>{item.description}</Text>
            <Text>
              {data.currency} {item.amount.toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>No earnings yet.</Text>}
      />
    </View>
  );
}