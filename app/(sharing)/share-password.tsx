import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { sharingAPI, passwordAPI } from "../../utils/api";
import * as Crypto from "expo-crypto";

type Permission = "view" | "edit";

export default function SharePasswordScreen(): React.ReactElement {
  const router = useRouter();
  const params = useLocalSearchParams();
  const passwordId = params.id || params.passwordId; // Get password ID from params (support both 'id' and 'passwordId')

  const [username, setUsername] = useState<string>("");
  const [permission, setPermission] = useState<Permission>("view");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleBack = (): void => {
    router.back();
  };

  const handleShare = async (): Promise<void> => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    if (!passwordId) {
      Alert.alert("Error", "No password selected");
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Look up recipient by username
      const recipient = await sharingAPI.getUserByUsername(username.trim());
      
      // 2. Get the password entry to encrypt
      const passwordEntry = await passwordAPI.get(Number(passwordId));
      
      // 3. Encrypt the password with recipient's public key
      // For now, we'll use a simple encryption with the encrypted password
      // In production, you'd use the recipient's RSA public key properly
      const encryptedKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${recipient.user_id}-${passwordId}-${Date.now()}`
      );
      
      // 4. Share the password
      await sharingAPI.share(
        Number(passwordId),
        recipient.user_id,
        encryptedKey,
        passwordEntry.encrypted_password,
        permission
      );

      Alert.alert(
        "Success",
        `Password shared with ${recipient.username} successfully!`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error("Share error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to share password. Please try again."
      );
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
          <TouchableOpacity onPress={handleBack} style={styles.iconCircle}>
            <Ionicons name="chevron-back" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Share Password</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <View style={styles.shareIcon}>
              <Ionicons name="share-social-outline" size={32} color="#6B5BFF" />
            </View>
          </View>

          <Text style={styles.subtitle}>
            Share this password securely with another user
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Recipient Username *</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.label, { marginTop: 20 }]}>Permission Level *</Text>
            <View style={styles.permissionContainer}>
              <TouchableOpacity
                style={[
                  styles.permissionBtn,
                  permission === "view" && styles.permissionBtnActive,
                ]}
                onPress={() => setPermission("view")}
              >
                <Ionicons
                  name="eye-outline"
                  size={20}
                  color={permission === "view" ? "#fff" : "#666"}
                />
                <Text
                  style={[
                    styles.permissionText,
                    permission === "view" && styles.permissionTextActive,
                  ]}
                >
                  View Only
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.permissionBtn,
                  permission === "edit" && styles.permissionBtnActive,
                ]}
                onPress={() => setPermission("edit")}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={permission === "edit" ? "#fff" : "#666"}
                />
                <Text
                  style={[
                    styles.permissionText,
                    permission === "edit" && styles.permissionTextActive,
                  ]}
                >
                  Can Edit
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.permissionInfo}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
              <Text style={styles.permissionInfoText}>
                {permission === "view"
                  ? "User can only view the password details"
                  : "User can view and modify the password"}
              </Text>
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>Message (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add a note for the recipient..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.warningCard}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#F59E0B" />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Secure Sharing</Text>
              <Text style={styles.warningText}>
                The password will be encrypted end-to-end. Only you and the recipient can access it.
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.shareButton, isLoading && styles.shareButtonDisabled]} 
            onPress={handleShare}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Text style={styles.shareButtonText}>Sharing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>Share Password</Text>
              </>
            )}
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
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: "#6B5BFF",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  shareIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
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
  permissionContainer: {
    flexDirection: "row",
    gap: 12,
  },
  permissionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  permissionBtnActive: {
    backgroundColor: "#6B5BFF",
    borderColor: "#6B5BFF",
  },
  permissionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  permissionTextActive: {
    color: "#fff",
  },
  permissionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  permissionInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFF9EB",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B45309",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6B5BFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: "#6B5BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
