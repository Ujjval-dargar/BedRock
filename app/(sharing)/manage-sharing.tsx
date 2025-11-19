import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { sharingAPI, passwordAPI } from "../../utils/api";
import { useFocusEffect } from "@react-navigation/native";

type SharedUser = {
  shareId: number;
  userId: number;
  username: string;
  email: string;
  sharedDate: string;
  permission: string;
};

export default function ManageSharingScreen(): React.ReactElement {
  const router = useRouter();
  const params = useLocalSearchParams();
  const passwordId = params.id as string;
  const type = params.type as "received" | "sent";

  const [passwordInfo, setPasswordInfo] = useState<any>(null);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [linkSharingEnabled, setLinkSharingEnabled] = useState(false);
  const [expirationEnabled, setExpirationEnabled] = useState(false);

  const fetchShareData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch password info
      const password = await passwordAPI.get(Number(passwordId));
      setPasswordInfo({
        title: password.title,
        username: password.username,
        category: password.category || "Other",
      });

      // Fetch all shares for this password
      const shares = await sharingAPI.getPasswordShares(Number(passwordId));
      
      // Fetch user info for each share
      const usersWithDetails = await Promise.all(
        shares.map(async (share) => {
          try {
            const user = await sharingAPI.getUserById(share.to_user_id);
            return {
              shareId: share.id,
              userId: user.user_id,
              username: user.username,
              email: user.email,
              sharedDate: new Date(share.created_at).toLocaleDateString(),
              permission: share.permission || "view",
            };
          } catch {
            return null;
          }
        })
      );
      
      const validUsers = usersWithDetails.filter((u): u is SharedUser => u !== null);
      setSharedUsers(validUsers);
    } catch (error) {
      console.error("Error fetching share data:", error);
      Alert.alert("Error", "Failed to load sharing information");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchShareData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleBack = (): void => {
    router.back();
  };

  const handleAddUser = (): void => {
    router.push(`/share-password?id=${passwordId}` as any);
  };

  const handleRemoveUser = async (shareId: number, username: string): Promise<void> => {
    Alert.alert(
      "Remove Access",
      `Are you sure you want to revoke access for ${username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await sharingAPI.deleteShare(shareId);
              Alert.alert("Success", "Access revoked successfully");
              fetchShareData(); // Refresh the list
            } catch {
              Alert.alert("Error", "Failed to revoke access");
            }
          },
        },
      ]
    );
  };

  const handleCopyLink = (): void => {
    Alert.alert("Success", "Sharing link copied to clipboard");
  };

  const handleStopSharing = (): void => {
    Alert.alert(
      "Stop Sharing",
      "Are you sure you want to stop sharing this password with everyone?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop Sharing",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Password sharing stopped", [
              { text: "OK", onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const SAView: any = SafeAreaView;

  if (isLoading || !passwordInfo) {
    return (
      <SAView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.iconCircle}>
            <Ionicons name="chevron-back" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Sharing</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={[styles.content, { justifyContent: "center", alignItems: "center" }]}>
          <Text>Loading...</Text>
        </View>
      </SAView>
    );
  }

  return (
    <SAView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconCircle}>
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Sharing</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Password Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="play-circle" size={28} color="#E50914" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{passwordInfo.title}</Text>
            <Text style={styles.infoUsername}>{passwordInfo.username}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{passwordInfo.category}</Text>
            </View>
          </View>
        </View>

        {/* Shared Users Section */}
        {type === "sent" && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shared with ({sharedUsers.length})</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
                <Ionicons name="add-circle" size={20} color="#6B5BFF" />
                <Text style={styles.addButtonText}>Add User</Text>
              </TouchableOpacity>
            </View>

            {sharedUsers.map((user, index) => (
              <View key={index} style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={styles.userEmail}>{user.username}</Text>
                  <Text style={styles.userMeta}>
                    Shared {user.sharedDate}
                  </Text>
                </View>

                <View style={styles.userActions}>
                  <View style={styles.permissionPill}>
                    <Ionicons
                      name={user.permission === "edit" ? "create-outline" : "eye-outline"}
                      size={14}
                      color={user.permission === "edit" ? "#6B5BFF" : "#059669"}
                    />
                    <Text style={[styles.permissionPillText, user.permission === "edit" && styles.editPermissionText]}>
                      {user.permission === "edit" ? "Edit" : "View"}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveUser(user.shareId, user.username)}
                  >
                    <Ionicons name="close-circle-outline" size={24} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Link Sharing */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons name="link-outline" size={20} color="#6B5BFF" />
                  <Text style={styles.cardTitle}>Link Sharing</Text>
                </View>
                <Switch
                  value={linkSharingEnabled}
                  onValueChange={setLinkSharingEnabled}
                  trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                  thumbColor={linkSharingEnabled ? "#6B5BFF" : "#F3F4F6"}
                />
              </View>
              
              {linkSharingEnabled && (
                <>
                  <Text style={styles.cardDescription}>
                    Anyone with the link can access this password
                  </Text>
                  <TouchableOpacity style={styles.linkButton} onPress={handleCopyLink}>
                    <Ionicons name="copy-outline" size={18} color="#6B5BFF" />
                    <Text style={styles.linkButtonText}>Copy Link</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Expiration Settings */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons name="time-outline" size={20} color="#6B5BFF" />
                  <Text style={styles.cardTitle}>Auto Expiration</Text>
                </View>
                <Switch
                  value={expirationEnabled}
                  onValueChange={setExpirationEnabled}
                  trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                  thumbColor={expirationEnabled ? "#6B5BFF" : "#F3F4F6"}
                />
              </View>
              
              {expirationEnabled && (
                <Text style={styles.cardDescription}>
                  Sharing will automatically expire after 30 days
                </Text>
              )}
            </View>

            {/* Stop Sharing Button */}
            <TouchableOpacity style={styles.stopSharingButton} onPress={handleStopSharing}>
              <Ionicons name="ban-outline" size={20} color="#DC2626" />
              <Text style={styles.stopSharingText}>Stop Sharing with Everyone</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Received Password Info */}
        {type === "received" && (
          <>
            <View style={styles.receivedCard}>
              <Ionicons name="information-circle" size={24} color="#6B5BFF" />
              <View style={styles.receivedInfo}>
                <Text style={styles.receivedTitle}>
                  {sharedUsers.length > 0 ? `Shared by ${sharedUsers[0].username}` : "Shared password"}
                </Text>
                <Text style={styles.receivedText}>
                  You have view access to this password
                </Text>
                <Text style={styles.receivedDate}>
                  {sharedUsers.length > 0 ? `Shared ${sharedUsers[0].sharedDate}` : ""}
                </Text>
              </View>
            </View>

            <View style={styles.permissionCard}>
              <Text style={styles.permissionCardTitle}>Your Permissions</Text>
              <View style={styles.permissionItem}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text style={styles.permissionItemText}>View password details</Text>
              </View>
              <View style={styles.permissionItem}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text style={styles.permissionItemText}>Copy password</Text>
              </View>
              <View style={styles.permissionItem}>
                <Ionicons name="close-circle" size={20} color="#D1D5DB" />
                <Text style={[styles.permissionItemText, styles.permissionItemDisabled]}>
                  Edit password
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.leaveButton}>
              <Ionicons name="exit-outline" size={20} color="#DC2626" />
              <Text style={styles.leaveButtonText}>Remove from My Vault</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
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
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  infoUsername: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0EDFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B5BFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B5BFF",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6B5BFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  permissionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  permissionPillEdit: {
    backgroundColor: "#EFF6FF",
  },
  permissionPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  editPermissionText: {
    color: "#6B5BFF",
  },
  permissionPillTextEdit: {
    color: "#2563EB",
  },
  removeButton: {
    padding: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F0EDFF",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B5BFF",
  },
  stopSharingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  stopSharingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
  receivedCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  receivedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  receivedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  receivedText: {
    fontSize: 13,
    color: "#3B82F6",
    marginBottom: 6,
  },
  receivedDate: {
    fontSize: 12,
    color: "#60A5FA",
  },
  permissionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  permissionItemText: {
    fontSize: 14,
    color: "#374151",
  },
  permissionItemDisabled: {
    color: "#9CA3AF",
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  leaveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
});
