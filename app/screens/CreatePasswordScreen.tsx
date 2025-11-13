import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";

export default function CreatePasswordScreen(): React.ReactElement {
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("Browser");
  const [url, setUrl] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secure, setSecure] = useState<boolean>(true);

  const categories = ["Browser", "Email", "Bank", "Social", "Other"];

  const handleRandomize = (): void => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let res = "";
    const len = 12;
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleCopyPassword = async (): Promise<void> => {
    if (!password) {
      Alert.alert("No password to copy");
      return;
    }
    await Clipboard.setStringAsync(password);
    Alert.alert("Copied to clipboard");
  };

  const handleAddToVault = (): void => {
    if (!title.trim()) {
      Alert.alert("Please enter a title");
      return;
    }
    if (!username.trim()) {
      Alert.alert("Please enter a username");
      return;
    }
    // TODO: persist the password
    router.push('/');
  };

  const SAView: any = SafeAreaView;

  return (
    <SAView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.smallCircle}>
              <Ionicons name="chevron-back" size={18} color="#000" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Create Password</Text>
            <View style={{ width: 34 }} />
          </View>

          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <Ionicons name="globe-outline" size={28} color="#333" />
            </View>
            <Text style={styles.iconLabel}>Change icon</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Google Classroom"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Category</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={category}
                onValueChange={(val: string | number) => setCategory(String(val))}
                style={styles.picker}
                mode="dropdown"
              >
                {categories.map((c) => (
                  <Picker.Item label={c} value={c} key={c} />
                ))}
              </Picker>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>URL</Text>
            <TextInput
              style={styles.input}
              placeholder="www.example.com"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>User Name</Text>
            <TextInput
              style={styles.input}
              placeholder="username@example.com"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Password</Text>
            <View style={styles.passwordRow}>
              <View style={styles.passwordLeft}>
                <Ionicons name="lock-closed-outline" size={18} color="#6B5BFF" />
              </View>

              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                autoCapitalize="none"
              />

              <TouchableOpacity onPress={() => setSecure((s) => !s)} style={styles.iconBtn}>
                <Ionicons name={secure ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleRandomize} style={styles.iconBtn}>
                <Ionicons name="sync-outline" size={20} color="#6B5BFF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleAddToVault}>
            <Text style={styles.addBtnText}>Add to vault</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SAView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F2F6FB",
  },
  scroll: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 6,
  },
  smallCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#6B5BFF",
  },
  iconWrap: {
    alignItems: "center",
    marginVertical: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EFEFF3",
  },
  iconLabel: {
    marginTop: 8,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#EFEFF3",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#EFEFF3",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 44,
    width: "100%",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFF3",
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  passwordLeft: {
    paddingHorizontal: 6,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  iconBtn: {
    padding: 8,
  },
  addBtn: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#6B5BFF",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
