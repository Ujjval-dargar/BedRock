import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Slider's bundled types conflict in this workspace; import as `any` to avoid TS errors.
// This is a small, reversible workaround until a full types cleanup is done.
const Slider: any = (require('@react-native-community/slider') as any).default ?? require('@react-native-community/slider');
import * as Clipboard from "expo-clipboard";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function GeneratorScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();

  const [password, setPassword] = useState<string>("");
  const [length, setLength] = useState<number>(32);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeSpecial, setIncludeSpecial] = useState<boolean>(false);

  const generatePassword = (): void => {
    let chars = "";
    if (includeNumbers) chars += "0123456789";
    if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeSpecial) chars += "!@#$%^&*()_+~|}{[]:;?><,./-=";

    if (!chars) {
      Alert.alert("Select at least one character set!");
      return;
    }

    let generated = "";
    for (let i = 0; i < length; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(generated);
  };

  const copyToClipboard = async (): Promise<void> => {
    if (!password) {
      Alert.alert("No password to copy");
      return;
    }
    await Clipboard.setStringAsync(password);
    Alert.alert("Copied!", "Password copied to clipboard.");
  };

  const handleBack = (): void => {
    try {
      // @ts-ignore - runtime check for availability
      if (navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Home" as never);
      }
    } catch {
      navigation.navigate("Home" as never);
    }
  };

  // Cast SafeAreaView to `any` for the style/edges prop typing mismatch in this workspace
  const SAView: any = SafeAreaView;

  // generate an initial password on first render
  React.useEffect(() => {
    generatePassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SAView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.circleButton} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Password Generator</Text>

        <TouchableOpacity onPress={generatePassword} style={styles.circleButton} accessibilityLabel="Refresh">
          <Ionicons name="refresh" size={18} color="#6B5BFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={[styles.inputRow, { marginTop: 8 }]}
        >
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Generated password"
            placeholderTextColor="#999"
            editable
            selectTextOnFocus
            multiline={false}
          />

          <TouchableOpacity onPress={generatePassword} style={styles.refreshBtn} accessibilityLabel="Regenerate">
            <Ionicons name="refresh" size={20} color="#6B5BFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard} accessibilityLabel="Copy password">
          <Text style={styles.copyText}>Copy Password</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Length</Text>
            <Text style={styles.value}>{length}</Text>
          </View>

          <Slider
            minimumValue={8}
            maximumValue={128}
            step={1}
            value={length}
            onValueChange={(v: number) => setLength(Math.round(v))}
            minimumTrackTintColor="#6B5BFF"
            maximumTrackTintColor="#EEE"
            thumbTintColor="#6B5BFF"
            style={{ marginTop: 12 }}
          />

          <View style={styles.optionsCard}>
            <Option label="Numbers" value={includeNumbers} onValueChange={setIncludeNumbers} />
            <Option label="Lowercase" value={includeLowercase} onValueChange={setIncludeLowercase} />
            <Option label="Uppercase" value={includeUppercase} onValueChange={setIncludeUppercase} />
            <Option label="Special Characters" value={includeSpecial} onValueChange={setIncludeSpecial} />
          </View>
        </View>
      </View>
    </SAView>
  );
}

type OptionProps = {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
};

function Option({ label, value, onValueChange }: OptionProps): React.ReactElement {
  return (
    <View style={styles.optionRow}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? "#6B5BFF" : Platform.OS === "android" ? "#f4f3f4" : undefined}
        trackColor={{ false: "#DCDCDC", true: "#E5E0FF" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9F9FC",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  arrow: {
    fontSize: 20,
    color: "#000",
    marginBottom: 1, // visually center the arrow
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B5BFF",
    textAlign: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: "#333",
  },
  refreshBtn: {
    padding: 8,
  },
  refreshIcon: {
    color: "#6B5BFF",
    fontSize: 20,
  },
  copyBtn: {
    backgroundColor: "#6B5BFF",
    borderRadius: 20,
    marginTop: 15,
    paddingVertical: 12,
  },
  copyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  section: {
    marginTop: 25,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    color: "#444",
  },
  value: {
    color: "#6B5BFF",
    fontWeight: "700",
  },
  optionsCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EFEFF3",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: "#333",
  },
});
