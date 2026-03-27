import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Login() {
  const { login, user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      Alert.alert("Login Failed", "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const colors = {
    bg: isDark ? "#000" : "#fff",
    card: isDark ? "#111" : "rgba(255,255,255,0.9)",
    text: isDark ? "#fff" : "#3e3e3e",
    subText: isDark ? "#aaa" : "#666",
    inputBg: isDark ? "#222" : "#f5f5f5",
    placeholder: isDark ? "#888" : "#999",
    eye: isDark ? "#aaa" : "#666",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        }}
        style={styles.backgroundImage}
      />

      <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Welcome to Myntra
        </Text>

        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Login to continue shopping
        </Text>

        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.inputBg, color: colors.text },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View
          style={[styles.passwordContainer, { backgroundColor: colors.inputBg }]}
        >
          <TextInput
            style={[styles.passwordInput, { color: colors.text }]}
            placeholder="Password"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.eye} />
            ) : (
              <Eye size={20} color={colors.eye} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupLink}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  backgroundImage: {
    width: "100%",
    height: "50%",
    position: "absolute",
    top: 0,
  },

  formContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    marginTop: "55%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },

  eyeIcon: {
    padding: 15,
  },

  button: {
    backgroundColor: "#ff3f6c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  signupLink: {
    color: "#ff3f6c",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
  },
});