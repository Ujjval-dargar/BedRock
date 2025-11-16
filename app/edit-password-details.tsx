import React, { useEffect, useState } from "react";
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

import { useLocalSearchParams, useRouter } from "expo-router";

export default function EditPasswordScreen(props: any): React.ReactElement {
  const { route, navigation } = props || {};
  const router = useRouter();
  const localParams = useLocalSearchParams() as any;

  const idFromRoute =
    (route && route.params && route.params.id) ||
    (route && route.params && route.params?.id?.toString()) ||
    (localParams && localParams.id) ||
    undefined;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Browser");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  useEffect(() => {
    const sample = {
      title: "Google",
      category: "Browser",
      url: "www.classroom.google.com",
      username: "thunderbolts@iiitd.ac.in",
      password: "s3cr3tP@ssw0rd",
    };
    setTitle(sample.title);
    setCategory(sample.category);
    setUrl(sample.url);
    setUsername(sample.username);
    setPassword(sample.password);
  }, [idFromRoute]);

  const handleSave = (): void => {
    if (!title.trim()) {
      Alert.alert("Title required");
      return;
    }
    if (navigation && typeof navigation.navigate === "function") {
      navigation.navigate("/");
    } else {
      router.push("/");
    }
  };

  const handleBack = (): void => {
    if (navigation && typeof navigation.goBack === "function") {
      navigation.goBack();
    } else {
      router.back();
    }
  };

  const randomize = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let res = "";
    for (let i = 0; i < 12; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(res);
  };

  const handleDelete = (): void => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this password?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Deleted");
            if (navigation && navigation.navigate) {
              navigation.navigate("/");
            } else {
              router.push("/");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const SAView: any = SafeAreaView;

  return (
    <SAView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack} style={styles.smallCircle}>
              <Ionicons name="chevron-back" size={18} color="#000" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Edit Password</Text>
            <View style={{ width: 34 }} />
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Category</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={category} onValueChange={(v: string | number) => setCategory(String(v))}>
                <Picker.Item label="Browser" value="Browser" />
                <Picker.Item label="Email" value="Email" />
                <Picker.Item label="Bank" value="Bank" />
                <Picker.Item label="Social" value="Social" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>URL</Text>
            <TextInput style={styles.input} value={url} onChangeText={setUrl} autoCapitalize="none" />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>User Name</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Password</Text>
            <View style={styles.passwordRow}>
              <View style={styles.passwordLeft}>
                <Ionicons name="lock-closed-outline" size={18} color="#6B5BFF" />
              </View>

              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                autoCapitalize="none"
              />

              <TouchableOpacity onPress={() => setSecure((s) => !s)} style={styles.iconBtn}>
                <Ionicons name={secure ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity onPress={randomize} style={styles.iconBtn}>
                <Ionicons name="sync-outline" size={20} color="#6B5BFF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleSave}>
            <Text style={styles.addBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SAView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F6FB" },
  scroll: { padding: 20, alignItems: "center", paddingBottom: 40 },
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
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#6B5BFF" },
  card: { backgroundColor: "#fff", width: "100%", borderRadius: 12, padding: 16, marginTop: 10 },
  fieldLabel: { fontSize: 14, color: "#333", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#EFEFF3",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  pickerWrap: { borderWidth: 1, borderColor: "#EFEFF3", borderRadius: 8, overflow: "hidden" },
  passwordRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EFEFF3", borderRadius: 8, paddingHorizontal: 8, backgroundColor: "#fff" },
  passwordLeft: { paddingHorizontal: 6 },
  passwordInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 6 },
  iconBtn: { padding: 8 },
  addBtn: { marginTop: 20, width: "100%", backgroundColor: "#6B5BFF", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  deleteBtn: {
    marginTop: 12,
    width: "100%",
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  deleteBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
