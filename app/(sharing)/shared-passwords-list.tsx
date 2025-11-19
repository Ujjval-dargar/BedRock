import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { sharingAPI, passwordAPI } from "../../utils/api";
import { useFocusEffect } from "@react-navigation/native";

const Tab = createMaterialTopTabNavigator();

type SharedPassword = {
  id: number;
  entry_id: number;
  title: string;
  username: string;
  sharedWith?: string;
  sharedBy?: string;
  from_user_id: number;
  to_user_id: number;
  status: string;
  sharedDate: string;
  category: string;
  permission?: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  Browser: "globe-outline",
  Social: "people-outline",
  Work: "briefcase-outline",
  Card: "card-outline",
  Email: "mail-outline",
  Other: "apps-outline",
};

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  Browser: { bg: "#EFF6FF", icon: "#3B82F6" },
  Social: { bg: "#FCE7F3", icon: "#EC4899" },
  Work: { bg: "#F3E8FF", icon: "#8B5CF6" },
  Card: { bg: "#D1FAE5", icon: "#10B981" },
  Email: { bg: "#FEF3C7", icon: "#F59E0B" },
  Other: { bg: "#F3F4F6", icon: "#6B7280" },
};

const SharedPasswordCard = ({ item, type }: { item: SharedPassword; type: "received" | "sent" }) => {
  const router = useRouter();

    const handleCardPress = (item: SharedPassword, type: "incoming" | "outgoing") => {
    if (type === "outgoing") {
      router.push(`/(sharing)/manage-sharing?id=${item.entry_id}&shareId=${item.id}&type=${type}` as any);
    } else {
      router.push(`/(password-management)/view-password-details?id=${item.entry_id}` as any);
    }
  };

  const iconName = CATEGORY_ICONS[item.category] || "apps-outline";
  const categoryColors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={[styles.cardIconContainer, { backgroundColor: categoryColors.bg }]}>
        <Ionicons name={iconName as any} size={24} color={categoryColors.icon} />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={[styles.permissionBadge, item.permission === "edit" && styles.permissionBadgeEdit]}>
            <Ionicons
              name={item.permission === "edit" ? "create-outline" : "eye-outline"}
              size={12}
              color={item.permission === "edit" ? "#6B5BFF" : "#059669"}
            />
            <Text style={[styles.permissionText, item.permission === "edit" && styles.permissionTextEdit]}>
              {item.permission === "edit" ? "Edit" : "View"}
            </Text>
          </View>
        </View>
        
        <Text style={styles.cardUsername}>{item.username}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.sharedInfo}>
            <Ionicons
              name={type === "received" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
              size={14}
              color="#666"
            />
            <Text style={styles.sharedText}>
              {type === "received" 
                ? `From ${item.sharedBy || "Unknown"}` 
                : `To ${item.sharedWith || "Unknown"}`}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.sharedDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function SharedWithMeTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<SharedPassword[]>([]);
  const [filteredData, setFilteredData] = useState<SharedPassword[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSharedPasswords = async () => {
    try {
      setIsLoading(true);
      const shares = await sharingAPI.getIncoming();
      
      // Fetch password details and sender info for each share
      const passwordsWithDetails = await Promise.all(
        shares.map(async (share) => {
          try {
            if (!share.entry_id) return null;
            const password = await passwordAPI.get(share.entry_id);
            
            // Fetch sender information
            let sharedBy = "Unknown";
            try {
              const sender = await sharingAPI.getUserById(share.from_user_id);
              sharedBy = sender.username;
            } catch {
              // If we can't fetch sender, use "Unknown"
            }
            
            return {
              id: share.id,
              entry_id: share.entry_id,
              title: password.title,
              username: password.username || "",
              from_user_id: share.from_user_id || 0,
              to_user_id: share.to_user_id || 0,
              sharedBy: sharedBy,
              status: share.status,
              sharedDate: new Date(share.created_at).toLocaleDateString(),
              category: password.category || "Other",
              permission: (share as any).permission || "view",
            };
          } catch {
            return null;
          }
        })
      );
      
      const validPasswords = passwordsWithDetails.filter(p => p !== null) as SharedPassword[];
      setData(validPasswords);
      setFilteredData(validPasswords);
    } catch (error) {
      console.error("Error fetching shared passwords:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSharedPasswords();
    }, [])
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (item: SharedPassword) =>
          item.title.toLowerCase().includes(text.toLowerCase()) ||
          item.username.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.tabContainer, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search shared passwords..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      
      {filteredData.length > 0 ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {filteredData.map((item) => (
            <SharedPasswordCard key={item.id} item={item} type="received" />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="share-off-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No shared passwords</Text>
          <Text style={styles.emptyText}>
            Passwords shared with you will appear here
          </Text>
        </View>
      )}
    </View>
  );
}

function SharedByMeTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<SharedPassword[]>([]);
  const [filteredData, setFilteredData] = useState<SharedPassword[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSharedPasswords = async () => {
    try {
      setIsLoading(true);
      const shares = await sharingAPI.getOutgoing();
      
      // Fetch password details and recipient info for each share
      const passwordsWithDetails = await Promise.all(
        shares.map(async (share) => {
          try {
            if (!share.entry_id) return null;
            const password = await passwordAPI.get(share.entry_id);
            
            // Fetch recipient information
            let sharedWith = "Unknown";
            try {
              const recipient = await sharingAPI.getUserById(share.to_user_id);
              sharedWith = recipient.username;
            } catch {
              // If we can't fetch recipient, use "Unknown"
            }
            
            return {
              id: share.id,
              entry_id: share.entry_id,
              title: password.title,
              username: password.username || "",
              from_user_id: share.from_user_id || 0,
              to_user_id: share.to_user_id || 0,
              sharedWith: sharedWith,
              status: share.status,
              sharedDate: new Date(share.created_at).toLocaleDateString(),
              category: password.category || "Other",
              permission: (share as any).permission || "view",
            };
          } catch {
            return null;
          }
        })
      );
      
      const validPasswords = passwordsWithDetails.filter(p => p !== null) as SharedPassword[];
      setData(validPasswords);
      setFilteredData(validPasswords);
    } catch (error) {
      console.error("Error fetching outgoing shares:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSharedPasswords();
    }, [])
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (item: SharedPassword) =>
          item.title.toLowerCase().includes(text.toLowerCase()) ||
          item.username.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.tabContainer, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search shared passwords..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      
      {filteredData.length > 0 ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {filteredData.map((item) => (
            <SharedPasswordCard key={item.id} item={item} type="sent" />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="share-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No passwords shared</Text>
          <Text style={styles.emptyText}>
            Start sharing passwords securely with others
          </Text>
        </View>
      )}
    </View>
  );
}

export default function SharedPasswordsListScreen(): React.ReactElement {
  const router = useRouter();

  const handleBack = (): void => {
    router.back();
  };

  const SAView: any = SafeAreaView;

  return (
    <SAView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconCircle}>
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Shared Passwords</Text>
        <View style={{ width: 36 }} />
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#6B5BFF",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarIndicatorStyle: {
            backgroundColor: "#6B5BFF",
            height: 3,
            borderRadius: 2,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "600",
            textTransform: "none",
          },
          tabBarStyle: {
            backgroundColor: "#fff",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          },
        }}
      >
        <Tab.Screen
          name="SharedWithMe"
          component={SharedWithMeTab}
          options={{ tabBarLabel: "Shared with Me" }}
        />
        <Tab.Screen
          name="SharedByMe"
          component={SharedByMeTab}
          options={{ tabBarLabel: "Shared by Me" }}
        />
      </Tab.Navigator>
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
  tabContainer: {
    flex: 1,
    backgroundColor: "#F2F6FB",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  permissionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  permissionBadgeEdit: {
    backgroundColor: "#EFF6FF",
  },
  permissionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
  },
  permissionTextEdit: {
    color: "#2563EB",
  },
  cardUsername: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sharedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  sharedText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});
