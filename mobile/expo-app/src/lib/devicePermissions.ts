import * as Camera from "expo-camera";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

export async function ensureCameraPermission() {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === "granted";
}

export async function ensureLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function ensureNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}