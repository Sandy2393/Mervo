import React, { useState } from "react";
import { View, Text, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

type Props = {
  onUpload: (localPath: string) => Promise<void>;
};

export default function PhotoUploader({ onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");

  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5, allowsEditing: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    await handleCompressAndUpload(asset.uri);
  };

  const handleCompressAndUpload = async (uri: string) => {
    setStatus("compressing");
    const manipulated = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1600 } }], {
      compress: 0.6,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    setPreview(manipulated.uri);
    setStatus("uploading");
    const localPath = await moveToCache(manipulated.uri);
    await onUpload(localPath);
    setStatus("done");
  };

  const moveToCache = async (uri: string) => {
    const fileName = uri.split("/").pop() || `photo-${Date.now()}.jpg`;
    const dest = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  };

  return (
    <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8 }}>
      <Text style={{ fontWeight: "600", marginBottom: 8 }}>Proof-of-work photos</Text>
      <Button title="Capture photo" onPress={pickImage} />
      {preview && (
        <View style={{ marginTop: 12 }}>
          <Image source={{ uri: preview }} style={{ width: "100%", height: 180, borderRadius: 8 }} />
          <Text>Status: {status}</Text>
        </View>
      )}
      {!preview && <Text style={{ marginTop: 8 }}>No photo captured yet.</Text>}
    </View>
  );
}