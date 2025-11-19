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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Slider's bundled types conflict in this workspace; import as `any` to avoid TS errors.
const Slider: any = (require('@react-native-community/slider') as any).default ?? require('@react-native-community/slider');
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BOTTOM_SAFE_AREA } from '@/constants/layout';

export default function GeneratorScreen(): React.ReactElement {
  const router = useRouter();

  const [password, setPassword] = useState<string>("");
  const [length, setLength] = useState<number>(16);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeSpecial, setIncludeSpecial] = useState<boolean>(true);

  const generatePassword = (): void => {
    let chars = "";
    if (includeNumbers) chars += "0123456789";
    if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeSpecial) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!chars) {
      Alert.alert("Error", "Please select at least one character type!");
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
      Alert.alert("Error", "Generate a password first");
      return;
    }
    await Clipboard.setStringAsync(password);
    Alert.alert("Copied!", "Password copied to clipboard");
  };

  const useInNewPassword = (): void => {
    if (!password) {
      Alert.alert("Error", "Generate a password first");
      return;
    }
    // Navigate to add-password screen with the generated password
    router.push({
      pathname: '/(password-management)/add-password',
      params: { generatedPassword: password }
    } as any);
  };

  // Generate initial password on mount
  React.useEffect(() => {
    generatePassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-regenerate when settings change
  React.useEffect(() => {
    if (password) {
      generatePassword();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, includeNumbers, includeLowercase, includeUppercase, includeSpecial]);

  const getPasswordStrength = (): { label: string; color: string; percentage: number } => {
    let strength = 0;
    if (length >= 12) strength += 25;
    if (length >= 16) strength += 15;
    if (includeNumbers) strength += 15;
    if (includeLowercase) strength += 15;
    if (includeUppercase) strength += 15;
    if (includeSpecial) strength += 15;

    if (strength >= 80) return { label: "Very Strong", color: "#10B981", percentage: 100 };
    if (strength >= 60) return { label: "Strong", color: "#3B82F6", percentage: 75 };
    if (strength >= 40) return { label: "Medium", color: "#F59E0B", percentage: 50 };
    return { label: "Weak", color: "#EF4444", percentage: 25 };
  };

  const strength = getPasswordStrength();
  const SAView: any = SafeAreaView;

  return (
    <SAView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={styles.headerTitle}>Password Generator</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Generated Password Display */}
        <View style={styles.passwordCard}>
          <View style={styles.passwordHeader}>
            <Text style={styles.passwordLabel}>Generated Password</Text>
            <TouchableOpacity onPress={generatePassword} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color="#6B5BFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.passwordDisplay}>
            <TextInput
              style={styles.passwordText}
              value={password}
              onChangeText={setPassword}
              selectTextOnFocus
              multiline
              numberOfLines={2}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Strength Indicator */}
          <View style={styles.strengthContainer}>
            <Text style={styles.strengthLabel}>Strength:</Text>
            <View style={styles.strengthBarContainer}>
              <View style={styles.strengthBarBg}>
                <View
                  style={[
                    styles.strengthBarFill,
                    {
                      width: `${strength.percentage}%`,
                      backgroundColor: strength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthText, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
              <Ionicons name="copy-outline" size={20} color="#fff" />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.useButton} onPress={useInNewPassword}>
              <Ionicons name="add-circle" size={20} color="#6B5BFF" />
              <Text style={styles.useButtonText}>Use Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Length Slider */}
        <View style={styles.card}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Password Length</Text>
            <View style={styles.lengthBadge}>
              <Text style={styles.lengthValue}>{length}</Text>
            </View>
          </View>
          <Slider
            minimumValue={8}
            maximumValue={64}
            step={1}
            value={length}
            onValueChange={(v: number) => setLength(Math.round(v))}
            minimumTrackTintColor="#6B5BFF"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#6B5BFF"
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>8</Text>
            <Text style={styles.sliderLabelText}>64</Text>
          </View>
        </View>

        {/* Character Options */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Character Types</Text>
          <View style={styles.optionsContainer}>
            <OptionRow
              icon="calculator-outline"
              label="Numbers (0-9)"
              value={includeNumbers}
              onValueChange={setIncludeNumbers}
              color="#3B82F6"
            />
            <OptionRow
              icon="text-outline"
              label="Lowercase (a-z)"
              value={includeLowercase}
              onValueChange={setIncludeLowercase}
              color="#8B5CF6"
            />
            <OptionRow
              icon="text-outline"
              label="Uppercase (A-Z)"
              value={includeUppercase}
              onValueChange={setIncludeUppercase}
              color="#6B5BFF"
            />
            <OptionRow
              icon="code-slash-outline"
              label="Special Characters (!@#$...)"
              value={includeSpecial}
              onValueChange={setIncludeSpecial}
              color="#10B981"
            />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#6B5BFF" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Security Tips</Text>
            <Text style={styles.infoText}>
              • Use at least 16 characters{"\n"}
              • Include all character types{"\n"}
              • Avoid common words or patterns{"\n"}
              • Use unique passwords for each account
            </Text>
          </View>
        </View>
      </ScrollView>
    </SAView>
  );
}

type OptionRowProps = {
  icon: string;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  color: string;
};

function OptionRow({ icon, label, value, onValueChange, color }: OptionRowProps): React.ReactElement {
  return (
    <View style={styles.optionRow}>
      <View style={styles.optionLeft}>
        <View style={[styles.optionIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? "#6B5BFF" : "#F3F4F6"}
        trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F2F6FB",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  passwordCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  passwordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F0EDFF",
  },
  passwordDisplay: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#6B5BFF",
  },
  passwordText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 1,
    textAlign: "center",
  },
  strengthContainer: {
    marginBottom: 16,
  },
  strengthLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  strengthBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  strengthBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 80,
    textAlign: "right",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  copyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6B5BFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    shadowColor: "#6B5BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  useButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#6B5BFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  useButtonText: {
    color: "#6B5BFF",
    fontSize: 15,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  lengthBadge: {
    backgroundColor: "#6B5BFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 50,
    alignItems: "center",
  },
  lengthValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  slider: {
    marginTop: 8,
    marginBottom: 8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabelText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 6,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#3B82F6",
    lineHeight: 20,
  },
});
