import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { passwordAPI, storageAPI, sharingAPI, SharedPassword } from "../utils/api";
import { aesDecrypt } from "../utils/crypto";
import * as Clipboard from 'expo-clipboard';

const CATEGORY_COLORS: Record<string, { icon: string; color: string }> = {
  Browser: { icon: 'globe', color: '#3B82F6' },
  Social: { icon: 'people', color: '#EC4899' },
  Work: { icon: 'briefcase', color: '#8B5CF6' },
  Card: { icon: 'card', color: '#10B981' },
  Email: { icon: 'mail', color: '#F59E0B' },
  Other: { icon: 'apps', color: '#6B7280' },
};

interface PasswordDetails {
  id: number;
  owner_id: number;
  title: string;
  username: string;
  password: string;
  url?: string;
  category?: string;
  notes?: string;
}

export default function ViewPasswordScreen(props: any): React.ReactElement {
  const { route, navigation } = props || {};
  const router = useRouter();
  const localParams = useLocalSearchParams() as any;

  const idFromRoute =
    (route && route.params && route.params.id) ||
    (route && route.params && route.params?.id?.toString()) ||
    (localParams && localParams.id) ||
    undefined;

  const [item, setItem] = useState<PasswordDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
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

  useEffect(() => {
    if (!idFromRoute) return;
    
    const fetchPasswordDetails = async () => {
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
        
        setItem({
          id: passwordEntry.id,
          owner_id: passwordEntry.owner_id,
          title: passwordEntry.title,
          username: passwordEntry.username || 'No username',
          password: decryptedPassword,
          url: passwordEntry.url || '',
          category: passwordEntry.category || 'Other',
          notes: passwordEntry.notes,
        });
        
        // Check if password is shared with current user and get permission
        const userId = await storageAPI.getUserId();
        if (userId && userId !== passwordEntry.owner_id) {
          try {
            const shares = await sharingAPI.getIncoming();
            const currentShare = shares.find((s: any) => s.entry_id === passwordEntry.id);
            if (currentShare) {
              setSharePermission(currentShare.permission);
            }
          } catch (error) {
            console.error('Failed to fetch share permission:', error);
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch password:', error);
        Alert.alert('Error', error.message || 'Failed to load password details');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    
    fetchPasswordDetails();
  }, [idFromRoute, router]);

  const handleBack = (): void => {
    if (navigation && typeof navigation.goBack === "function") navigation.goBack();
    else router.back();
  };

  const handleEdit = (): void => {
    const path = `/edit-password-details?id=${encodeURIComponent(String(item?.id || ""))}`;
    if (navigation && typeof navigation.navigate === "function") {
      try {
        navigation.navigate('/edit-password-details' as any, { id: item?.id } as any);
      } catch {
        router.push(path as any);
      }
    } else {
      router.push(path as any);
    }
  };

  const handleCopy = async (text: string, label: string): Promise<void> => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const SAView: any = SafeAreaView;

  if (loading) {
    return (
      <SAView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.iconCircle}>
            <Ionicons name="chevron-back" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>View Password</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
        <Text style={styles.title}>View Password</Text>
        <View style={{ width: 36 }} />
      </View>

      {item ? (
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.category && CATEGORY_COLORS[item.category] && (
              <View style={[styles.categoryBadge, { backgroundColor: `${CATEGORY_COLORS[item.category].color}15` }]}>
                <Ionicons 
                  name={CATEGORY_COLORS[item.category].icon as any} 
                  size={14} 
                  color={CATEGORY_COLORS[item.category].color} 
                />
                <Text style={[styles.categoryText, { color: CATEGORY_COLORS[item.category].color }]}>
                  {item.category}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Username</Text>
              <Text style={styles.value}>{item.username}</Text>
            </View>
            <TouchableOpacity 
              style={styles.copyButton} 
              onPress={() => handleCopy(item.username, 'Username')}
            >
              <Ionicons name="copy-outline" size={20} color="#6B5BFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Password</Text>
              <Text style={styles.value}>••••••••</Text>
            </View>
            <TouchableOpacity 
              style={styles.copyButton} 
              onPress={() => handleCopy(item.password, 'Password')}
            >
              <Ionicons name="copy-outline" size={20} color="#6B5BFF" />
            </TouchableOpacity>
          </View>

          {item.url && (
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>URL</Text>
                <Text style={styles.value}>{item.url}</Text>
              </View>
            </View>
          )}

          {item.notes && (
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Notes</Text>
                <Text style={styles.value}>{item.notes}</Text>
              </View>
            </View>
          )}

          {currentUserId && (currentUserId === item.owner_id || sharePermission === "edit") && (
            <View style={styles.buttonRow}>
              {currentUserId === item.owner_id && (
                <TouchableOpacity style={styles.shareBtn} onPress={() => router.push(`/share-password?id=${item.id}`)}>
                  <Ionicons name="share-social-outline" size={18} color="#6B5BFF" />
                  <Text style={styles.shareBtnText}>Share</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={currentUserId === item.owner_id ? styles.editBtn : styles.editBtnFull} onPress={handleEdit}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentUserId && currentUserId !== item.owner_id && sharePermission === "view" && (
            <View style={styles.sharedInfo}>
              <Ionicons name="information-circle" size={20} color="#6B5BFF" />
              <Text style={styles.sharedInfoText}>This password is shared with you (view only)</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={{ padding: 16 }}>No password details found</Text>
      )}
    </SAView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F6FB" },
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
    backgroundColor: "#fff", 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  title: { fontWeight: "700", fontSize: 18, color: "#6B5BFF" },
  card: { 
    margin: 16, 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemTitle: { 
    fontSize: 24, 
    fontWeight: "800", 
    color: "#6B5BFF",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  label: { 
    fontSize: 12,
    color: "#6B7280", 
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  value: { 
    fontSize: 16, 
    color: "#111827",
    fontWeight: "500",
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  buttonRow: { 
    flexDirection: "row", 
    gap: 12, 
    marginTop: 24,
  },
  shareBtn: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 6, 
    backgroundColor: "#F0EDFF", 
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: "#6B5BFF",
  },
  shareBtnText: { 
    color: "#6B5BFF", 
    fontWeight: "700", 
    fontSize: 15,
  },
  editBtn: { 
    flex: 1, 
    backgroundColor: "#6B5BFF", 
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12, 
    alignItems: "center",
  },
  editBtnFull: {
    flex: 1,
    backgroundColor: "#6B5BFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  editText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 15,
  },
  sharedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  sharedInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#6B5BFF",
  },
});
