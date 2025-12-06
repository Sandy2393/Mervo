import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") return null;
  }
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? "TODO-eas-project-id";
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  // TODO: send token.data to backend for registration
  return token.data;
}

export function onNotificationResponse() {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("Notification tapped", response.notification.request.content.data);
  });
}