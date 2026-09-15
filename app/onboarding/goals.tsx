import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Chip,
  SegmentedButtons,
  Checkbox,
  IconButton,
  ProgressBar,
  HelperText,
} from "react-native-paper";
import { router } from "expo-router";
import { listPaymentMethods, PaymentMethod } from "@/api/paymentMethods";
import {
  listSavingsGoals,
  createSavingsGoal,
  deleteSavingsGoal,
  SavingsGoal,
} from "@/api/savingsGoals";
import type { Priority } from "@/api/expenses";
import { useAuth } from "@/context/AuthContext";

export default function OnboardingGoals() {
  const { completeOnboarding } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [items, setItems] = useState<SavingsGoal[]>([]);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [priority, setPriority] = useState<Priority>("important");
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const [pm, goals] = await Promise.all([listPaymentMethods(), listSavingsGoals()]);
    setPaymentMethods(pm);
    setItems(goals);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    setError("");
    if (!name.trim() || !target) {
      setError("Nombre y monto objetivo son obligatorios");
      return;
    }
    setLoading(true);
    try {
      await createSavingsGoal({
        name: name.trim(),
        target_amount: parseFloat(target),
        current_amount: current ? parseFloat(current) : 0,
        deadline: null,
        is_emergency_fund: isEmergency,
        priority,
        payment_method_id: paymentMethodId,
      });
      setName("");
      setTarget("");
      setCurrent("");
      setIsEmergency(false);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteSavingsGoal(id);
    await load();
  };

  const handleFinish = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <ProgressBar progress={1} style={styles.progress} />
      <Text variant="headlineSmall" style={styles.title}>
        Metas de ahorro
      </Text>
      <Text style={styles.subtitle}>Incluye tu fondo de emergencia si quieres uno (es opcional).</Text>

      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={{ flex: 1 }}>
            {item.name} — meta ${item.target_amount.toLocaleString("es-CO")}
          </Text>
          <IconButton icon="delete" size={18} onPress={() => handleDelete(item.id)} />
        </View>
      ))}

      <TextInput label="Nombre de la meta" value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        label="Monto objetivo"
        value={target}
        onChangeText={setTarget}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Monto actual ahorrado (opcional)"
        value={current}
        onChangeText={setCurrent}
        keyboardType="numeric"
        style={styles.input}
      />

      <Checkbox.Item
        label="Es mi fondo de emergencia"
        status={isEmergency ? "checked" : "unchecked"}
        onPress={() => setIsEmergency(!isEmergency)}
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

      <Text style={styles.label}>Medio de pago / dónde ahorras</Text>
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
        Agregar meta
      </Button>

      <Button mode="contained" style={styles.nextButton} onPress={handleFinish}>
        Finalizar y empezar a usar la app
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
