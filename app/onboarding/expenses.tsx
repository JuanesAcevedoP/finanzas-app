import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Text,
  SegmentedButtons,
  Chip,
  Checkbox,
  IconButton,
  ProgressBar,
  HelperText,
} from "react-native-paper";
import { router } from "expo-router";
import { listPaymentMethods, PaymentMethod } from "@/api/paymentMethods";
import { listCategories, Category } from "@/api/categories";
import { listExpenses, createExpense, deleteExpense, Expense, Frequency, Priority } from "@/api/expenses";
import { convertToCOP } from "@/api/currency";

export default function OnboardingExpenses() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Expense[]>([]);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [isForeign, setIsForeign] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [isSubscription, setIsSubscription] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>("mensual");
  const [dueDay, setDueDay] = useState("");
  const [priority, setPriority] = useState<Priority>("important");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const [pm, cat, exp] = await Promise.all([listPaymentMethods(), listCategories(), listExpenses()]);
    setPaymentMethods(pm);
    setCategories(cat);
    setItems(exp);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    setError("");
    if (!name.trim() || !amount) {
      setError("Nombre y monto son obligatorios");
      return;
    }
    setLoading(true);
    try {
      let amountCop = parseFloat(amount);
      let originalAmount: number | null = null;
      let originalCurrency: string | null = null;

      if (isForeign) {
        originalAmount = parseFloat(amount);
        originalCurrency = currency.trim().toUpperCase();
        amountCop = await convertToCOP(originalAmount, originalCurrency);
      }

      await createExpense({
        name: name.trim(),
        amount_cop: amountCop,
        original_amount: originalAmount,
        original_currency: originalCurrency,
        is_subscription: isSubscription,
        frequency,
        due_day: dueDay ? parseInt(dueDay, 10) : null,
        priority,
        category_id: categoryId,
        payment_method_id: paymentMethodId,
      });

      setName("");
      setAmount("");
      setDueDay("");
      setIsForeign(false);
      setIsSubscription(false);
      await load();
    } catch (e) {
      setError("No se pudo agregar el gasto (revisa la moneda o los datos)");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteExpense(id);
    await load();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <ProgressBar progress={0.75} style={styles.progress} />
      <Text variant="headlineSmall" style={styles.title}>
        Tus gastos fijos
      </Text>
      <Text style={styles.subtitle}>Arriendo, suscripciones, servicios... lo que se repite cada periodo.</Text>

      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={{ flex: 1 }}>
            {item.name} — ${item.amount_cop.toLocaleString("es-CO")} ({item.priority})
          </Text>
          <IconButton icon="delete" size={18} onPress={() => handleDelete(item.id)} />
        </View>
      ))}

      <TextInput label="Nombre del gasto" value={name} onChangeText={setName} style={styles.input} />

      <Checkbox.Item
        label="Se paga en otra moneda (ej. suscripción en USD)"
        status={isForeign ? "checked" : "unchecked"}
        onPress={() => setIsForeign(!isForeign)}
      />
      {isForeign && (
        <TextInput
          label="Moneda (ej. USD)"
          value={currency}
          onChangeText={setCurrency}
          autoCapitalize="characters"
          style={styles.input}
        />
      )}
      <TextInput
        label={isForeign ? `Monto en ${currency || "moneda"}` : "Monto en COP"}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <Checkbox.Item
        label="Es una suscripción"
        status={isSubscription ? "checked" : "unchecked"}
        onPress={() => setIsSubscription(!isSubscription)}
      />

      <Text style={styles.label}>Frecuencia</Text>
      <SegmentedButtons
        value={frequency}
        onValueChange={(v) => setFrequency(v as Frequency)}
        buttons={[
          { value: "quincenal", label: "Quincenal" },
          { value: "mensual", label: "Mensual" },
          { value: "anual", label: "Anual" },
          { value: "unico", label: "Único" },
        ]}
        style={styles.input}
      />

      <TextInput
        label="Día del mes en que vence (ej. 25)"
        value={dueDay}
        onChangeText={setDueDay}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Prioridad</Text>
      <SegmentedButtons
        value={priority}
        onValueChange={(v) => setPriority(v as Priority)}
        buttons={[
          { value: "essential", label: "Esencial" },
          { value: "important", label: "Importante" },
          { value: "optional", label: "Opcional" },
        ]}
        style={styles.input}
      />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chipRow}>
        {categories.map((c) => (
          <Chip
            key={c.id}
            selected={categoryId === c.id}
            onPress={() => setCategoryId(c.id)}
            style={styles.chip}
          >
            {c.name}
          </Chip>
        ))}
      </View>

      <Text style={styles.label}>Medio de pago</Text>
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

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button mode="outlined" onPress={handleAdd} loading={loading} style={styles.addButton}>
        Agregar gasto
      </Button>

      <Button mode="contained" style={styles.nextButton} onPress={() => router.push("/onboarding/goals")}>
        Siguiente
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  progress: { marginBottom: 16 },
  title: { marginBottom: 4 },
  subtitle: { marginBottom: 16, opacity: 0.7 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  input: { marginBottom: 12 },
  label: { marginBottom: 6, marginTop: 4, fontWeight: "600" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  chip: { marginRight: 8, marginBottom: 8 },
  addButton: { marginBottom: 24 },
  nextButton: { marginTop: 8 },
});
