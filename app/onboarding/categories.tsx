import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { TextInput, Button, Text, IconButton, ProgressBar } from "react-native-paper";
import { router } from "expo-router";
import { listCategories, createCategory, deleteCategory, Category } from "@/api/categories";

export default function OnboardingCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => listCategories().then(setItems);

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createCategory({ name: name.trim() });
      setName("");
      await load();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteCategory(id);
    await load();
  };

  return (
    <View style={styles.container}>
      <ProgressBar progress={0.5} style={styles.progress} />
      <Text variant="headlineSmall" style={styles.title}>
        ¿En qué categorías se van tus gastos?
      </Text>
      <Text style={styles.subtitle}>Ej. Arriendo, Comida, Transporte, Suscripciones.</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.name}</Text>
            <IconButton icon="delete" size={18} onPress={() => handleDelete(item.id)} />
          </View>
        )}
        style={styles.list}
      />

      <TextInput label="Nombre (ej. Comida)" value={name} onChangeText={setName} style={styles.input} />
      <Button mode="outlined" onPress={handleAdd} loading={loading} style={styles.addButton}>
        Agregar
      </Button>

      <Button
        mode="contained"
        style={styles.nextButton}
        disabled={items.length === 0}
        onPress={() => router.push("/onboarding/expenses")}
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
  list: { maxHeight: 220, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  input: { marginBottom: 4 },
  addButton: { marginBottom: 24 },
  nextButton: { marginTop: "auto" },
});
