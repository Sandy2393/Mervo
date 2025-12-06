import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, Button, ActivityIndicator } from "react-native";
import ContractorDashboard from "./screens/ContractorDashboard";
import JobExecution from "./screens/JobExecution";
import Earnings from "./screens/Earnings";
import { registerForPushNotificationsAsync, onNotificationResponse } from "./lib/pushNotifications";
import { getQueueLength, drainQueueWithBackoff } from "./lib/mobileOfflineQueue";

type AuthState = {
  token: string | null;
  userId: string | null;
};

type AuthContextType = {
  auth: AuthState;
  login: (token: string, userId: string) => void;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const Stack = createNativeStackNavigator();

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ token: null, userId: null });
  const [queueCount, setQueueCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sub = onNotificationResponse();
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await registerForPushNotificationsAsync();
        await refreshQueueCount();
        drainQueueWithBackoff();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const refreshQueueCount = useCallback(async () => {
    const count = await getQueueLength();
    setQueueCount(count);
  }, []);

  const login = useCallback((token: string, userId: string) => setAuth({ token, userId }), []);
  const logout = useCallback(() => setAuth({ token: null, userId: null }), []);

  const authValue = useMemo(() => ({ auth, login, logout }), [auth, login, logout]);

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={authValue}>
        <NavigationContainer>
          <StatusBar style="light" />
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8 }}>Preparing mobile app…</Text>
            </View>
          ) : (
            <Stack.Navigator>
              <Stack.Screen
                name="Dashboard"
                options={{ title: "Today" }}
              >
                {(props) => (
                  <ContractorDashboard
                    {...props}
                    queueCount={queueCount}
                    refreshQueueCount={refreshQueueCount}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="JobExecution" component={JobExecution} options={{ title: "Job" }} />
              <Stack.Screen name="Earnings" component={Earnings} options={{ title: "Earnings" }} />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: "Settings" }}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

function SettingsScreen() {
  const authCtx = React.useContext(AuthContext);
  if (!authCtx) return null;
  const { auth, logout } = authCtx;
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Account</Text>
      <Text>Signed in as: {auth.userId ?? "guest"}</Text>
      <Button title="Logout" onPress={logout} />
      <View style={{ marginTop: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Privacy & Retention</Text>
        <Text style={{ marginBottom: 4 }}>
          Photos and logs are retained per company policy. Delete requests honored via support.
        </Text>
      </View>
    </View>
  );
}