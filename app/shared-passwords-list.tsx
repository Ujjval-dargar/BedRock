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

const Tab = createMaterialTopTabNavigator();

type SharedPassword = {
  id: string;
  title: string;
  username: string;
  sharedWith?: string;
  sharedBy?: string;
  permission: "view" | "edit";
  sharedDate: string;
  icon: string;
  category: string;
};

// Mock data
const sharedWithMeData: SharedPassword[] = [
  {
    id: "1",
    title: "Netflix",
    username: "family@email.com",
    sharedBy: "john.doe@email.com",
    permission: "view",
    sharedDate: "2 days ago",
    icon: "logo-netflix",
    category: "Entertainment",
  },
  {
    id: "2",
    title: "AWS Console",
    username: "admin@company.com",
    sharedBy: "manager@company.com",
    permission: "edit",
    sharedDate: "1 week ago",
    icon: "cloud-outline",
    category: "Work",
  },
];

const sharedByMeData: SharedPassword[] = [
  {
    id: "3",
    title: "Spotify",
    username: "myaccount@email.com",
    sharedWith: "friend@email.com",
    permission: "view",
    sharedDate: "3 days ago",
    icon: "musical-notes",
    category: "Music",
  },
  {
    id: "4",
    title: "GitHub",
    username: "developer@email.com",
    sharedWith: "teammate@email.com",
    permission: "edit",
    sharedDate: "5 days ago",
    icon: "logo-github",
    category: "Development",
  },
];

const SharedPasswordCard = ({ item, type }: { item: SharedPassword; type: "received" | "sent" }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/manage-sharing?id=${item.id}&type=${type}` as any);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardIconContainer}>
        <Ionicons name={item.icon as any} size={24} color="#6B5BFF" />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View
            style={[
              styles.permissionBadge,
              item.permission === "edit" && styles.permissionBadgeEdit,
            ]}
          >
            <Ionicons
              name={item.permission === "view" ? "eye-outline" : "create-outline"}
              size={12}
              color={item.permission === "view" ? "#059669" : "#2563EB"}
            />
            <Text
              style={[
                styles.permissionText,
                item.permission === "edit" && styles.permissionTextEdit,
              ]}
            >
              {item.permission === "view" ? "View" : "Edit"}
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
              {type === "received" ? `From ${item.sharedBy}` : `To ${item.sharedWith}`}
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
  const [filteredData, setFilteredData] = useState(sharedWithMeData);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredData(sharedWithMeData);
    } else {
      const filtered = sharedWithMeData.filter(
        (item) =>
          item.title.toLowerCase().includes(text.toLowerCase()) ||
          item.username.toLowerCase().includes(text.toLowerCase()) ||
          (item.sharedBy && item.sharedBy.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredData(filtered);
    }
  };

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
  const [filteredData, setFilteredData] = useState(sharedByMeData);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredData(sharedByMeData);
    } else {
      const filtered = sharedByMeData.filter(
        (item) =>
          item.title.toLowerCase().includes(text.toLowerCase()) ||
          item.username.toLowerCase().includes(text.toLowerCase()) ||
          (item.sharedWith && item.sharedWith.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredData(filtered);
    }
  };

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
    backgroundColor: "#F0EDFF",
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
});
