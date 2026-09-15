import { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, ActivityIndicator, Card } from "react-native-paper";
import { useFocusEffect } from "expo-router";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { listBudgetPeriods, BudgetPeriod } from "@/api/income";
import { listExpenses, Expense } from "@/api/expenses";
import { listCategories, Category } from "@/api/categories";
import { listPaymentMethods, PaymentMethod } from "@/api/paymentMethods";

const PALETTE = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7"];

export default function StatsScreen() {
  const [periods, setPeriods] = useState<BudgetPeriod[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, e, c, pm] = await Promise.all([
        listBudgetPeriods(),
        listExpenses(),
        listCategories(),
        listPaymentMethods(),
      ]);
      setPeriods(p);
      setExpenses(e);
      setCategories(c);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const expenseById = new Map(expenses.map((e) => [e.id, e]));

  const categoryTotals = new Map<string, number>();
  const paymentMethodTotals = new Map<string, number>();

  periods.forEach((period) => {
    period.allocations.forEach((a) => {
      if (a.target_type !== "expense" || !a.expense_id) return;
      const exp = expenseById.get(a.expense_id);
      if (!exp) return;

      const catName = categories.find((c) => c.id === exp.category_id)?.name ?? "Sin categoría";
      categoryTotals.set(catName, (categoryTotals.get(catName) ?? 0) + a.planned_amount);

      const pmName = paymentMethods.find((pm) => pm.id === exp.payment_method_id)?.name ?? "Sin definir";
      paymentMethodTotals.set(pmName, (paymentMethodTotals.get(pmName) ?? 0) + a.planned_amount);
    });
  });

  const pieData = Array.from(categoryTotals.entries()).map(([name, value], i) => ({
    value,
    text: name,
    color: PALETTE[i % PALETTE.length],
    onPress: () => setSelectedSlice(`${name}: $${value.toLocaleString("es-CO")}`),
  }));

  const pmPieData = Array.from(paymentMethodTotals.entries()).map(([name, value], i) => ({
    value,
    text: name,
    color: PALETTE[(i + 3) % PALETTE.length],
  }));

  const barData = periods.slice(-6).flatMap((p) => {
    const allocated = p.allocations.reduce((sum, a) => sum + a.planned_amount, 0);
    return [
      { value: p.total_income, label: p.period_start.slice(5), frontColor: "#4e79a7" },
      { value: allocated, label: "", frontColor: "#e15759" },
    ];
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Estadísticas
      </Text>

      {pieData.length === 0 ? (
        <Text style={styles.empty}>Registra ingresos y gastos para ver tus estadísticas aquí.</Text>
      ) : (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Gastos por categoría
              </Text>
              <View style={styles.chartCenter}>
                <PieChart data={pieData} donut radius={90} innerRadius={55} focusOnPress />
              </View>
              {selectedSlice && <Text style={styles.selected}>{selectedSlice}</Text>}
              <View style={styles.legend}>
                {pieData.map((d) => (
                  <View key={d.text} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                    <Text style={styles.legendText}>{d.text}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Gastos por medio de pago
              </Text>
              <View style={styles.chartCenter}>
                <PieChart data={pmPieData} radius={90} focusOnPress />
              </View>
              <View style={styles.legend}>
                {pmPieData.map((d) => (
                  <View key={d.text} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                    <Text style={styles.legendText}>{d.text}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Ingreso vs. asignado por periodo
              </Text>
              <BarChart
                data={barData}
                barWidth={18}
                spacing={14}
                roundedTop
                noOfSections={4}
                yAxisTextStyle={{ fontSize: 10 }}
                xAxisLabelTextStyle={{ fontSize: 10 }}
              />
              <Text style={styles.hint}>Azul = ingreso total · Rojo = total asignado a gastos/ahorro</Text>
            </Card.Content>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { marginBottom: 16 },
  empty: { opacity: 0.7 },
  card: { marginBottom: 16 },
  cardTitle: { marginBottom: 12 },
  chartCenter: { alignItems: "center", marginBottom: 8 },
  selected: { textAlign: "center", marginBottom: 8, fontWeight: "600" },
  legend: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  legendRow: { flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  legendText: { fontSize: 12 },
  hint: { fontSize: 11, opacity: 0.6, marginTop: 8, textAlign: "center" },
});
