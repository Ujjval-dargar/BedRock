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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useLocalSearchParams, useRouter } from "expo-router";
import { passwordAPI, storageAPI, sharingAPI } from "../../utils/api";
import { aesDecrypt, aesEncrypt } from "../../utils/crypto";

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
  const [notes, setNotes] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [sharePermission, setSharePermission] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userId = await storageAPI.getUserId();
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Failed to get user ID:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Categories matching add-password screen
  const categories = [
    { label: "Browser", icon: "globe-outline", color: "#3B82F6" },
    { label: "Social", icon: "people-outline", color: "#EC4899" },
    { label: "Work", icon: "briefcase-outline", color: "#8B5CF6" },
    { label: "Card", icon: "card-outline", color: "#10B981" },
    { label: "Email", icon: "mail-outline", color: "#F59E0B" },
    { label: "Other", icon: "apps-outline", color: "#6B7280" },
  ];

  useEffect(() => {
    if (!idFromRoute) return;
    
    const fetchPassword = async () => {
      try {
        setLoading(true);
        const passwordEntry = await passwordAPI.get(Number(idFromRoute));
        const vaultKey = await storageAPI.getVaultKey();
        
        if (!vaultKey) {
          Alert.alert('Error', 'Vault key not found. Please login again.');
          router.back();
          return;
        }
        
        // Decrypt the password
        const decryptedPassword = await aesDecrypt(passwordEntry.encrypted_password, vaultKey);
        
        setOwnerId(passwordEntry.owner_id);
        setTitle(passwordEntry.title);
        setUsername(passwordEntry.username || '');
        setPassword(decryptedPassword);
        setCategory(passwordEntry.category || 'Browser');
        setUrl(passwordEntry.url || '');
        setNotes(passwordEntry.notes || '');
        
        // Check if user is not the owner and fetch permission
        const userId = await storageAPI.getUserId();
        if (userId && userId !== passwordEntry.owner_id) {
          try {
            const shares = await sharingAPI.getIncoming();
            const currentShare = shares.find((s: any) => s.entry_id === passwordEntry.id);
            if (currentShare) {
              setSharePermission(currentShare.permission);
              if (currentShare.permission !== "edit") {
                Alert.alert(
                  'Access Denied',
                  'You cannot edit this password as you only have view permission.',
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              }
            } else {
              Alert.alert(
                'Access Denied',
                'You do not have access to this password.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            }
          } catch (error) {
            console.error('Failed to check permission:', error);
            Alert.alert(
              'Error',
              'Failed to verify permissions.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch password:', error);
        Alert.alert('Error', error.message || 'Failed to load password');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    
    fetchPassword();
  }, [idFromRoute, router]);

  const handleSave = async (): Promise<void> => {
    // Check ownership or edit permission before saving
    if (currentUserId && ownerId) {
      if (currentUserId !== ownerId && sharePermission !== "edit") {
        Alert.alert('Error', 'You do not have permission to edit this password.');
        return;
      }
    }
    
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    
    if (!username.trim()) {
      Alert.alert("Error", "Username / Email is required");
      return;
    }
    
    if (!password.trim()) {
      Alert.alert("Error", "Password is required");
      return;
    }
    
    try {
      setSaving(true);
      const vaultKey = await storageAPI.getVaultKey();
      
      if (!vaultKey) {
        Alert.alert('Error', 'Vault key not found. Please login again.');
        return;
      }
      
      // Encrypt the password
      const encryptedPassword = await aesEncrypt(password, vaultKey);
      
      // Update on backend with category and notes
      await passwordAPI.update(
        Number(idFromRoute),
        title,
        username,
        encryptedPassword,
        url || undefined,
        category,
        notes || undefined
      );
      
      Alert.alert('Success', 'Password updated successfully');
      router.back();
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setSaving(false);
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
    for (let i = 0; i < 16; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(res);
  };

  const handleCopyPassword = async () => {
    // Copy functionality - you can add Clipboard here if needed
    Alert.alert("Copied", "Password copied to clipboard");
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
          onPress: async () => {
            try {
              await passwordAPI.delete(Number(idFromRoute));
              Alert.alert("Success", "Password deleted");
              // Navigate to vault after deletion
              router.push("/(tabs)/vault" as any);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete password");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const SAView: any = SafeAreaView;

  if (loading) {
    return (
      <SAView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.iconCircle}>
            <Ionicons name="chevron-back" size={18} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Password</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6B5BFF" />
          <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
        </View>
      </SAView>
    );
  }

  return (
    <SAView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.iconCircle}>
            <Ionicons name="chevron-back" size={18} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Password</Text>
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
              <TouchableOpacity style={styles.actionButton} onPress={randomize}>
                <Ionicons name="sync-outline" size={18} color="#6B5BFF" />
                <Text style={styles.actionButtonText}>Quick Generate</Text>
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
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={saving}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete Password</Text>
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
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B5BFF",
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
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "700",
  },
});
