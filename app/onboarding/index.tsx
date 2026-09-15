import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { TextInput, Button, Text, Checkbox, IconButton, ProgressBar } from "react-native-paper";
import { router } from "expo-router";
import {
  listPaymentMethods,
  createPaymentMethod,
  deletePaymentMethod,
  PaymentMethod,
} from "@/api/paymentMethods";

export default function OnboardingPaymentMethods() {
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [name, setName] = useState("");
  const [isCash, setIsCash] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () => listPaymentMethods().then(setItems);

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createPaymentMethod({ name: name.trim(), is_cash: isCash });
      setName("");
      setIsCash(false);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deletePaymentMethod(id);
    await load();
  };

  return (
    <View style={styles.container}>
      <ProgressBar progress={0.25} style={styles.progress} />
      <Text variant="headlineSmall" style={styles.title}>
        ¿Qué medios de pago usas?
      </Text>
      <Text style={styles.subtitle}>Ej. Nequi, Bancolombia, Efectivo. Agrega los que necesites.</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>
              {item.name}
              {item.is_cash ? " (efectivo)" : ""}
            </Text>
            <IconButton icon="delete" size={18} onPress={() => handleDelete(item.id)} />
          </View>
        )}
        style={styles.list}
      />

      <TextInput label="Nombre (ej. Nequi)" value={name} onChangeText={setName} style={styles.input} />
      <Checkbox.Item
        label="Es efectivo"
        status={isCash ? "checked" : "unchecked"}
        onPress={() => setIsCash(!isCash)}
      />
      <Button mode="outlined" onPress={handleAdd} loading={loading} style={styles.addButton}>
        Agregar
      </Button>

      <Button
        mode="contained"
        style={styles.nextButton}
        disabled={items.length === 0}
        onPress={() => router.push("/onboarding/categories")}
      >
        Siguiente
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  progress: { marginBottom: 16 },
  title: { marginBottom: 4 },
  subtitle: { marginBottom: 16, opacity: 0.7 },
  list: { maxHeight: 160, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  input: { marginBottom: 4 },
  addButton: { marginBottom: 24 },
  nextButton: { marginTop: "auto" },
});
