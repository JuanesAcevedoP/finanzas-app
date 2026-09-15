import { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import {
  Text,
  Card,
  Chip,
  Button,
  FAB,
  Portal,
  Dialog,
  TextInput,
  SegmentedButtons,
  ActivityIndicator,
} from "react-native-paper";
import { useFocusEffect } from "expo-router";
import { listBudgetPeriods, createIncome, completeAllocation, BudgetPeriod, Allocation } from "@/api/income";
import { listExpenses, Expense } from "@/api/expenses";
import { listSavingsGoals, SavingsGoal } from "@/api/savingsGoals";
import { listPaymentMethods, PaymentMethod } from "@/api/paymentMethods";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  completed: "Cumplido",
  at_risk: "En riesgo",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#9e9e9e",
  completed: "#4caf50",
  at_risk: "#f44336",
};

export default function DashboardScreen() {
  const [periods, setPeriods] = useState<BudgetPeriod[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"quincenal" | "mensual">("quincenal");
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, e, g, pm] = await Promise.all([
        listBudgetPeriods(),
        listExpenses(),
        listSavingsGoals(),
        listPaymentMethods(),
      ]);
      setPeriods(p);
      setExpenses(e);
      setGoals(g);
      setPaymentMethods(pm);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const currentPeriod = periods[periods.length - 1];

  const getTargetName = (a: Allocation) => {
    if (a.target_type === "expense") {
      return expenses.find((e) => e.id === a.expense_id)?.name ?? "Gasto";
    }
    return goals.find((g) => g.id === a.savings_goal_id)?.name ?? "Meta de ahorro";
  };

  const handleComplete = async (allocationId: number) => {
    await completeAllocation(allocationId);
    await load();
  };

  const handleCreateIncome = async () => {
    setError("");
    if (!amount) {
      setError("Ingresa el monto");
      return;
    }
    setSubmitting(true);
    try {
      await createIncome({
        amount: parseFloat(amount),
        frequency,
        received_date: receivedDate,
        payment_method_id: paymentMethodId,
      });
      setDialogVisible(false);
      setAmount("");
      await load();
    } catch (e) {
      setError("No se pudo registrar el ingreso, revisa los datos");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
      >
        <Text variant="headlineSmall" style={styles.title}>
          Presupuesto actual
        </Text>

        {!currentPeriod && (
          <Text style={styles.empty}>Aún no has registrado ningún ingreso. Usa el botón "+" para empezar.</Text>
        )}

        {currentPeriod && (
          <>
            <Text style={styles.periodRange}>
              {currentPeriod.period_start} → {currentPeriod.period_end} · Ingreso: $
              {currentPeriod.total_income.toLocaleString("es-CO")}
            </Text>

            {currentPeriod.allocations.map((a) => (
              <Card key={a.id} style={styles.card}>
                <Card.Content style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text>{getTargetName(a)}</Text>
                    <Text style={styles.amount}>${a.planned_amount.toLocaleString("es-CO")}</Text>
                  </View>
                  <Chip style={{ backgroundColor: STATUS_COLOR[a.status] }} textStyle={{ color: "white" }}>
                    {STATUS_LABEL[a.status]}
                  </Chip>
                </Card.Content>
                {a.status !== "completed" && (
                  <Card.Actions>
                    <Button onPress={() => handleComplete(a.id)}>Marcar como cumplido</Button>
                  </Card.Actions>
                )}
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setDialogVisible(true)} label="Ingreso" />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Registrar ingreso</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Monto"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <SegmentedButtons
              value={frequency}
              onValueChange={(v) => setFrequency(v as "quincenal" | "mensual")}
              buttons={[
                { value: "quincenal", label: "Quincenal" },
                { value: "mensual", label: "Mensual" },
              ]}
              style={styles.input}
            />
            <TextInput
              label="Fecha recibido (AAAA-MM-DD)"
              value={receivedDate}
              onChangeText={setReceivedDate}
              style={styles.input}
            />
            <View style={styles.chipRow}>
              {paymentMethods.map((pm) => (
                <Chip
                  key={pm.id}
                  selected={paymentMethodId === pm.id}
                  onPress={() => setPaymentMethodId(pm.id)}
                  style={styles.chip}
                >
                  {pm.name}
                </Chip>
              ))}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleCreateIncome} loading={submitting}>
              Guardar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { marginBottom: 12 },
  empty: { opacity: 0.7 },
  periodRange: { marginBottom: 16, opacity: 0.8 },
  card: { marginBottom: 10 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount: { opacity: 0.7, marginTop: 2 },
  fab: { position: "absolute", right: 16, bottom: 24 },
  input: { marginBottom: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  chip: { marginRight: 8, marginBottom: 8 },
  error: { color: "red" },
});
