import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Medios de pago" }} />
      <Stack.Screen name="categories" options={{ title: "Categorías" }} />
      <Stack.Screen name="expenses" options={{ title: "Gastos" }} />
      <Stack.Screen name="goals" options={{ title: "Metas de ahorro" }} />
    </Stack>
  );
}
