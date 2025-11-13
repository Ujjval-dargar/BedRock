import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ViewPasswordScreen(props: any): React.ReactElement {
  const { route, navigation } = props || {};
  const router = useRouter();
  const localParams = useLocalSearchParams() as any;

  const idFromRoute =
    (route && route.params && route.params.id) ||
    (route && route.params && route.params?.id?.toString()) ||
    (localParams && localParams.id) ||
    undefined;

  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    // fake fetch
    const sample = {
      id: idFromRoute || "1",
      title: "Google",
      username: "thunderbolts@iiitd.ac.in",
      password: "s3cr3tP@ssw0rd",
      url: "https://classroom.google.com",
    };
    setItem(sample);
  }, [idFromRoute]);

  const handleBack = (): void => {
    if (navigation && typeof navigation.goBack === "function") navigation.goBack();
    else router.back();
  };

  const handleEdit = (): void => {
    const path = `/edit-password?id=${encodeURIComponent(String(item?.id || ""))}`;
    if (navigation && typeof navigation.navigate === "function") {
      // navigation.navigate accepts route names depending on stack; fallback to router.push
      try {
        navigation.navigate('/edit-password' as any, { id: item?.id } as any);
      } catch (e) {
        router.push(path as any);
      }
    } else {
      router.push(path as any);
    }
  };

  const SAView: any = SafeAreaView;

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
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{item.username}</Text>

          <Text style={styles.label}>Password</Text>
          <Text style={styles.value}>{item.password}</Text>

          <Text style={styles.label}>URL</Text>
          <Text style={styles.value}>{item.url}</Text>

          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={{ padding: 16 }}>Loading...</Text>
      )}
    </SAView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F6FB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  title: { fontWeight: "700", fontSize: 18, color: "#6B5BFF" },
  card: { margin: 16, backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  itemTitle: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  label: { marginTop: 10, color: "#666", fontWeight: "600" },
  value: { marginTop: 6, color: "#222", fontSize: 16 },
  editBtn: { marginTop: 18, backgroundColor: "#6B5BFF", padding: 12, borderRadius: 10, alignItems: "center" },
  editText: { color: "#fff", fontWeight: "700" },
});
