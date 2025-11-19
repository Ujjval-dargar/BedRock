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
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { passwordAPI, storageAPI } from "../../utils/api";
import { aesEncrypt } from "../../utils/crypto";

export default function CreatePasswordScreen(): React.ReactElement {
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("Browser");
  const [url, setUrl] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secure, setSecure] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const categories = [
    { label: "Browser", icon: "globe-outline", color: "#3B82F6" },
    { label: "Social", icon: "people-outline", color: "#EC4899" },
    { label: "Work", icon: "briefcase-outline", color: "#8B5CF6" },
    { label: "Card", icon: "card-outline", color: "#10B981" },
    { label: "Email", icon: "mail-outline", color: "#F59E0B" },
    { label: "Other", icon: "apps-outline", color: "#6B7280" },
  ];

  const handleRandomize = (): void => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let res = "";
    const len = 16;
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    Alert.alert("Generated", "Strong password generated!");
  };

  const handleUseGenerator = (): void => {
    router.push("/(tabs)/generator" as any);
  };

  const handleCopyPassword = async (): Promise<void> => {
    if (!password) {
      Alert.alert("Error", "No password to copy");
      return;
    }
    await Clipboard.setStringAsync(password);
    Alert.alert("Copied", "Password copied to clipboard");
  };

  const handleAddToVault = async (): Promise<void> => {
    if (!title.trim()) {
      Alert.alert("Required Field", "Please enter a title");
      return;
    }
    if (!username.trim()) {
      Alert.alert("Required Field", "Please enter a username or email");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Required Field", "Please enter a password");
      return;
    }

    setIsLoading(true);

    try {
      // Get vault key from storage
      const vaultKey = await storageAPI.getVaultKey();
      if (!vaultKey) {
        Alert.alert("Error", "Please login again");
        router.replace('/(auth)/login' as any);
        return;
      }

      // Encrypt password with vault key
      const encryptedPassword = await aesEncrypt(password, vaultKey);

      // Create password entry on backend with url and category
      await passwordAPI.create(
        title,
        username || undefined,
        encryptedPassword,
        url || undefined,
        category,
        notes || undefined
      );

      Alert.alert(
        "Success",
        "Password saved to your vault!",
        [
          {
            text: "View Vault",
            onPress: () => router.push("/(tabs)/vault" as any),
          },
          {
            text: "Add Another",
            onPress: () => {
              setTitle("");
              setUsername("");
              setPassword("");
              setUrl("");
              setNotes("");
              setCategory("Browser");
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save password");
    } finally {
      setIsLoading(false);
    }
  };

  const SAView: any = SafeAreaView;

  return (
    <SAView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
            <Ionicons name="chevron-back" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Password</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <View style={styles.card}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Google Account"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category Selection */}
          <View style={styles.card}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.label}
                  style={[
                    styles.categoryChip,
                    category === cat.label && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat.label)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          category === cat.label ? cat.color : `${cat.color}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={18}
                      color={category === cat.label ? "#fff" : cat.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.label && styles.categoryTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Username Input */}
          <View style={styles.card}>
            <Text style={styles.label}>Username / Email *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="username@example.com"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.card}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.iconBtn}>
                <Ionicons
                  name={secure ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCopyPassword} style={styles.iconBtn}>
                <Ionicons name="copy-outline" size={20} color="#6B5BFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleRandomize}>
                <Ionicons name="sync-outline" size={18} color="#6B5BFF" />
                <Text style={styles.actionButtonText}>Quick Generate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={handleUseGenerator}
              >
                <Ionicons name="settings-outline" size={18} color="#fff" />
                <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                  Advanced Generator
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* URL Input */}
          <View style={styles.card}>
            <Text style={styles.label}>Website URL (Optional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="link-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="https://example.com"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Notes Input */}
          <View style={styles.card}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleAddToVault}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save to Vault</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6B5BFF",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#333",
  },
  iconBtn: {
    padding: 8,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "48%",
  },
  categoryChipActive: {
    backgroundColor: "#F0EDFF",
    borderColor: "#6B5BFF",
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    flex: 1,
  },
  categoryTextActive: {
    color: "#6B5BFF",
  },
  passwordActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F0EDFF",
    borderWidth: 1,
    borderColor: "#6B5BFF",
  },
  actionButtonPrimary: {
    backgroundColor: "#6B5BFF",
    borderColor: "#6B5BFF",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B5BFF",
  },
  actionButtonTextPrimary: {
    color: "#fff",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6B5BFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: "#6B5BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
