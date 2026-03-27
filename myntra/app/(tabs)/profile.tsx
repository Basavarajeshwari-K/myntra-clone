import { useRouter } from "expo-router";
import { ChevronRight, LogOut, Pencil } from "lucide-react-native";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { logout } = useAuth();

  const bg = isDark ? "#0f0f0f" : "#ffffff";
  const cardBg = isDark ? "#1c1c1e" : "#f3f3f3";
  const text = isDark ? "#ffffff" : "#000000";
  const subText = isDark ? "#b3b3b3" : "#666666";
  const border = isDark ? "#2c2c2e" : "#dddddd";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[styles.header, { color: text }]}>Profile</Text>

        {/* User Info */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.name, { color: text }]}>John Doe</Text>
            <Text style={[styles.email, { color: subText }]}>
              john.doe@example.com
            </Text>
            <TouchableOpacity
              style={[styles.editBtnInline, { borderColor: text }]}
              onPress={() => router.push("/edit-profile")}
            >
              <Pencil size={14} color={text} />
              <Text style={[styles.editText, { color: text }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        <Section
          title="Address"
          action="Edit"
          onAction={() => router.push("/address")}
          isDark={isDark}
        >
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: text }]}>John Doe</Text>
            <Text style={[styles.cardText, { color: subText }]}>
              123, MG Road
            </Text>
            <Text style={[styles.cardText, { color: subText }]}>
              Bangalore, Karnataka – 560001
            </Text>
          </View>
        </Section>

        {/* Payment */}
        <Section
          title="Payment Method"
          action="Edit"
          onAction={() => router.push("/payment-method")}
          isDark={isDark}
        >
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: text }]}>
              💳 Visa •••• 4242
            </Text>
          </View>
        </Section>

        {/* Menu */}
        <MenuItem label="Orders" onPress={() => router.push("/order")} />
        <MenuItem label="Wishlist" onPress={() => router.push("/wishlist")} />
        <MenuItem label="Settings" onPress={() => router.push("/settings")} />

        {/* My Transactions */}
        <TouchableOpacity
          style={[
            styles.menuItem,
            { backgroundColor: isDark ? "#1c1c1e" : "#f3f3f3" },
          ]}
          onPress={() => router.push("/profile-pages/MyTransactions")}
        >
          <Text
            style={[
              styles.menuText,
              { color: isDark ? "#fff" : "#000" },
            ]}
          >
            My Transactions
          </Text>
          <ChevronRight size={18} color={isDark ? "#fff" : "#888"} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[
            styles.logout,
            { backgroundColor: cardBg, borderColor: border },
          ]}
          onPress={handleLogout}
        >
          <LogOut size={18} color="#ff3b30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Reusable Components ---------- */

function Section({ title, action, onAction, children, isDark }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? "#fff" : "#000" },
          ]}
        >
          {title}
        </Text>
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.editLink}>{action}</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function MenuItem({ label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{label}</Text>
      <ChevronRight size={18} color="#888" />
    </TouchableOpacity>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  center: {
    alignItems: "center",
    marginBottom: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  editText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  editLink: {
    color: "#4da6ff",
    fontSize: 14,
  },
  card: {
    borderRadius: 14,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  cardText: {
    fontSize: 14,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#fff",
  },
  logout: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 18,
    borderRadius: 14,
    marginTop: 24,
    marginBottom: 40,
    borderWidth: 1,
  },
  logoutText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "600",
  },

  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4da6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  editBtnInline: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});