import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, RefreshControl } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthContext } from "../App";
import { listJobs, JobsResponse } from "@app-id/sdk-js";
import OfflineStatusIndicator from "../components/OfflineStatusIndicator";

type Props = NativeStackScreenProps<any, "Dashboard"> & {
  queueCount: number;
  refreshQueueCount: () => Promise<void>;
};

export default function ContractorDashboard({ navigation, queueCount, refreshQueueCount }: Props) {
  const authCtx = React.useContext(AuthContext);
  const token = authCtx?.auth.token;
  const [jobs, setJobs] = useState<JobsResponse>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = async () => {
    if (!token) return;
    const data = await listJobs({ token });
    setJobs(data);
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(refreshQueueCount, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    await refreshQueueCount();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: JobsResponse[number] }) => (
    <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#e5e7eb" }}>
      <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.title}</Text>
      <Text>{item.location}</Text>
      <Text>Due: {item.dueAt}</Text>
      <Button title="Open" onPress={() => navigation.navigate("JobExecution", { job: item })} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, backgroundColor: "#0f172a" }}>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>Today&apos;s Jobs</Text>
        <View style={{ marginTop: 6 }}>
          <OfflineStatusIndicator pending={queueCount} />
        </View>
      </View>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={{ padding: 16 }}>No jobs assigned.</Text>}
      />
      <View style={{ padding: 12, borderTopWidth: 1, borderColor: "#e5e7eb", flexDirection: "row", gap: 8 }}>
        <Button title="Earnings" onPress={() => navigation.navigate("Earnings")}></Button>
        <Button title="Settings" onPress={() => navigation.navigate("Settings")}></Button>
      </View>
    </View>
  );
}