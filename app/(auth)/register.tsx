import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (e) {
      setError("No se pudo registrar (¿ese correo ya existe?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Crear cuenta
      </Text>

      <TextInput label="Nombre" value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        label="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button mode="contained" onPress={handleRegister} loading={loading} style={styles.button}>
        Registrarme
      </Button>

      <Link href="/(auth)/login" style={styles.link}>
        ¿Ya tienes cuenta? Inicia sesión
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { marginBottom: 24, textAlign: "center" },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
  error: { color: "red", marginBottom: 8 },
  link: { marginTop: 16, textAlign: "center" },
});
