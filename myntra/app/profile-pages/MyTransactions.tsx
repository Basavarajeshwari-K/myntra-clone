import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Picker } from "@react-native-picker/picker";

interface Transaction {
  id: string;
  paymentMode: string;
  amount: number;
  status: string;
  date: string;
  productName: string;
  transactionType: string;
}

const BASE_URL = "http://192.168.1.2:5000/api";

// ✅ FIXED: directly define userId (removed extra state + useEffect)
const userId = "rajeshwari";

const MyTransactions = () => {
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [filterType, setFilterType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const bg = isDark ? "#0f0f0f" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const subText = isDark ? "#b3b3b3" : "#666666";
  const borderColor = isDark ? "#2c2c2e" : "#dddddd";
  const cardBg = isDark ? "#1c1c1e" : "#f3f3f3";
  const buttonColor = isDark ? "#4da6ff" : "#007bff";

  const typeOptions = ["", "Online", "COD", "Refund"];

  useEffect(() => {
    fetchTransactions();
  }, [filterType, startDate, endDate]);

  const fetchTransactions = async () => {
    if (startDate && endDate && startDate > endDate) {
      Alert.alert("Error", "Start date cannot be after end date.");
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params: any = {};
      if (filterType) params.type = filterType;
      if (startDate instanceof Date) params.dateFrom = startDate.toISOString();
      if (endDate instanceof Date) params.dateTo = endDate.toISOString();

      console.log("Fetching transactions with params:", params);

      const response = await axios.get(
        `${BASE_URL}/transactions/${userId}`,
        { params }
      );

      if (Array.isArray(response.data)) {
        const mappedTransactions = response.data.map((tx: any) => ({
          id: tx._id,
          paymentMode: tx.paymentMethod,
          amount: tx.amount,
          status: tx.status,
          date: new Date(tx.createdAt).toLocaleString(),
          productName: tx.productName,
          transactionType: tx.transactionType,
        }));
        setTransactions(mappedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.log("Fetch error:", error);
      Alert.alert("Error", "Failed to fetch transactions.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const renderButton = (title: string, onPress: () => void) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: buttonColor }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      const response = await axios.get(url, { responseType: "arraybuffer" });

      const binary = new Uint8Array(response.data);
      let binaryString = "";
      for (let i = 0; i < binary.byteLength; i++) {
        binaryString += String.fromCharCode(binary[i]);
      }
      const base64 = btoa(binaryString);

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.log("Download error:", err);
      Alert.alert("Error", "Failed to download file");
    }
  };

  const handleReceiptDownload = (transactionId: string) =>
    handleDownload(
      `${BASE_URL}/transactions/${transactionId}/receipt`,
      `receipt_${transactionId}.pdf`
    );

  const handleExportPDF = () =>
    handleDownload(
      `${BASE_URL}/transactions/export/pdf/${userId}`,
      "transactions.pdf"
    );

  const handleExportCSV = () =>
    handleDownload(
      `${BASE_URL}/transactions/export/csv/${userId}`,
      "transactions.csv"
    );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, { backgroundColor: bg }]}>
        <Text style={[styles.header, { color: textColor }]}>
          My Transactions
        </Text>

        <View style={styles.filterBar}>
          <Text style={{ color: subText }}>Type Filter</Text>

          <View style={[styles.pickerWrapper, { borderColor }]}>
            <Picker
              selectedValue={filterType}
              onValueChange={(itemValue) => setFilterType(itemValue)}
              style={{ color: textColor }}
            >
              {typeOptions.map((type) => (
                <Picker.Item key={type} label={type || "All"} value={type} />
              ))}
            </Picker>
          </View>

          <View
            style={{
              flexDirection: "row",
              marginTop: 10,
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={[styles.dateButton, { borderColor }]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={{ color: textColor }}>
                {startDate ? startDate.toLocaleDateString() : "Start Date"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateButton, { borderColor }]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={{ color: textColor }}>
                {endDate ? endDate.toLocaleDateString() : "End Date"}
              </Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={showStartPicker}
            mode="date"
            onConfirm={(date) => {
              setStartDate(date);
              setShowStartPicker(false);
            }}
            onCancel={() => setShowStartPicker(false)}
          />

          <DateTimePickerModal
            isVisible={showEndPicker}
            mode="date"
            onConfirm={(date) => {
              setEndDate(date);
              setShowEndPicker(false);
            }}
            onCancel={() => setShowEndPicker(false)}
          />
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color={textColor}
            style={{ marginVertical: 20 }}
          />
        )}

        {!loading && transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              No Transactions Yet
            </Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View
              key={tx.id}
              style={[styles.card, { backgroundColor: cardBg, borderColor }]}
            >
              <Text style={{ color: textColor }}>
                Product: {tx.productName}
              </Text>
              <Text style={{ color: textColor }}>
                Payment Mode: {tx.paymentMode}
              </Text>
              <Text style={{ color: textColor }}>
                Amount: ₹{tx.amount}
              </Text>
              <Text style={{ color: textColor }}>
                Status: {tx.status}
              </Text>
              <Text style={{ color: textColor }}>
                Transaction Type: {tx.transactionType}
              </Text>
              <Text style={{ color: textColor }}>
                Date/Time: {tx.date}
              </Text>

              <View style={styles.buttonWrapper}>
                {renderButton("Download Receipt", () =>
                  handleReceiptDownload(tx.id)
                )}
              </View>
            </View>
          ))
        )}

        {!loading && transactions.length > 0 && (
          <View style={styles.exportButtons}>
            {renderButton("Export PDF", handleExportPDF)}
            {renderButton("Export CSV", handleExportCSV)}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  filterBar: { marginBottom: 20 },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  exportButtons: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
  },
  buttonWrapper: { marginTop: 12 },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: { fontSize: 50, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
});

export default MyTransactions;