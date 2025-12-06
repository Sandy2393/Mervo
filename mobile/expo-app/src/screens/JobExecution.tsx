import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PhotoUploader from "../components/PhotoUploader";
import { clockIn, clockOut, submitReport } from "@app-id/sdk-js";
import { enqueueAction } from "../lib/mobileOfflineQueue";
import { ensureLocationPermission } from "../lib/devicePermissions";

type Props = NativeStackScreenProps<any, "JobExecution">;

export default function JobExecution({ route }: Props) {
  const { job } = route.params as any;
  const [status, setStatus] = useState<string>("pending");
  const [localPhotos, setLocalPhotos] = useState<string[]>([]);

  useEffect(() => {
    ensureLocationPermission();
  }, []);

  const handleClockIn = async () => {
    setStatus("in_progress");
    await enqueueAction({ type: "clockIn", jobId: job.id, at: new Date().toISOString() });
    Alert.alert("Clocked in", "Recorded locally; will sync when online.");
  };

  const handleClockOut = async () => {
    setStatus("completed");
    await enqueueAction({ type: "clockOut", jobId: job.id, at: new Date().toISOString() });
    Alert.alert("Clocked out", "Recorded locally; will sync when online.");
  };

  const handleUpload = async (path: string) => {
    setLocalPhotos((prev) => [...prev, path]);
    await enqueueAction({ type: "uploadPhoto", jobId: job.id, path, at: new Date().toISOString() });
  };

  const handleCompleteReport = async () => {
    await enqueueAction({ type: "submitReport", jobId: job.id, at: new Date().toISOString(), payload: { notes: "Work completed" } });
    Alert.alert("Report queued", "It will sync when connectivity returns.");
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>{job.title}</Text>
      <Text style={{ marginBottom: 12 }}>{job.location}</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <Button title="Clock In" onPress={handleClockIn} />
        <Button title="Clock Out" onPress={handleClockOut} />
      </View>
      <PhotoUploader onUpload={handleUpload} />
      <View style={{ marginTop: 16 }}>
        <Button title="Submit Report" onPress={handleCompleteReport} />
      </View>
      <View style={{ marginTop: 24 }}>
        <Text style={{ fontWeight: "600" }}>Local photos</Text>
        {localPhotos.map((p) => (
          <Text key={p} style={{ color: "#0f172a" }}>
            {p}
          </Text>
        ))}
        {localPhotos.length === 0 && <Text>No photos captured yet.</Text>}
      </View>
      <Text style={{ marginTop: 16 }}>Status: {status}</Text>
    </View>
  );
}