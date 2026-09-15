import { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, List, Button, IconButton, Divider, ActivityIndicator } from "react-native-paper";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { listPaymentMethods, deletePaymentMethod, PaymentMethod } from "@/api/paymentMethods";
import { listCategories, deleteCategory, Category } from "@/api/categories";
import { listExpenses, deleteExpense, Expense } from "@/api/expenses";
import { listSavingsGoals, deleteSavingsGoal, SavingsGoal } from "@/api/savingsGoals";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pm, cat, exp, g] = await Promise.all([
        listPaymentMethods(),
        listCategories(),
        listExpenses(),
        listSavingsGoals(),
      ]);
      setPaymentMethods(pm);
      setCategories(cat);
      setExpenses(exp);
      setGoals(g);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Ajustes
      </Text>

      <List.Section title="Medios de pago">
        {paymentMethods.map((pm) => (
          <List.Item
            key={pm.id}
            title={pm.name}
            right={() => <IconButton icon="delete" onPress={() => deletePaymentMethod(pm.id).then(load)} />}
          />
        ))}
      </List.Section>
      <Divider />

      <List.Section title="Categorías">
        {categories.map((c) => (
          <List.Item
            key={c.id}
            title={c.name}
            right={() => <IconButton icon="delete" onPress={() => deleteCategory(c.id).then(load)} />}
          />
        ))}
      </List.Section>
      <Divider />

      <List.Section title="Gastos">
        {expenses.map((e) => (
          <List.Item
            key={e.id}
            title={e.name}
            description={`$${e.amount_cop.toLocaleString("es-CO")} · ${e.frequency} · ${e.priority}`}
            right={() => <IconButton icon="delete" onPress={() => deleteExpense(e.id).then(load)} />}
          />
        ))}
      </List.Section>
      <Divider />

      <List.Section title="Metas de ahorro">
        {goals.map((g) => (
          <List.Item
            key={g.id}
            title={g.name}
            description={`$${g.current_amount.toLocaleString("es-CO")} / $${g.target_amount.toLocaleString(
              "es-CO"
            )}`}
            right={() => <IconButton icon="delete" onPress={() => deleteSavingsGoal(g.id).then(load)} />}
          />
        ))}
      </List.Section>

      <Button mode="outlined" onPress={logout} style={styles.logout}>
        Cerrar sesión
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { marginBottom: 12 },
  logout: { marginTop: 24, marginBottom: 40 },
});
