import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '@/components/back-button';
import Svg, { Path } from 'react-native-svg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { passwordAPI, storageAPI } from '@/utils/api';
import { aesDecrypt } from '@/utils/crypto';
import { validatePasswordStrength } from '@/utils/crypto';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';

// Helper function to create arc path
const createArcPath = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = {
    x: x + radius * Math.cos((startAngle * Math.PI) / 180),
    y: y + radius * Math.sin((startAngle * Math.PI) / 180),
  };
  const end = {
    x: x + radius * Math.cos((endAngle * Math.PI) / 180),
    y: y + radius * Math.sin((endAngle * Math.PI) / 180),
  };
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

// Color scheme - consistent across chart, legend, and cards
const PASSWORD_COLORS = {
  safe: {
    primary: '#10B981', // Vibrant green
    light: '#D1FAE5', // Light green background
    iconBg: 'rgba(16, 185, 129, 0.1)', // Green with opacity for icon background
  },
  weak: {
    primary: '#F59E0B', // Vibrant amber/yellow (distinct from duplicate)
    light: '#FEF3C7', // Light amber background
    iconBg: 'rgba(245, 158, 11, 0.1)', // Amber with opacity for icon background
  },
  leaked: {
    primary: '#EF4444', // Vibrant red
    light: '#FEE2E2', // Light red background
    iconBg: 'rgba(239, 68, 68, 0.1)', // Red with opacity for icon background
  },
  duplicate: {
    primary: '#8B5CF6', // Vibrant purple/violet (distinct from weak)
    light: '#EDE9FE', // Light purple background
    iconBg: 'rgba(139, 92, 246, 0.1)', // Purple with opacity for icon background
  },
};

// Donut Chart Component
const DonutChart = ({ 
  score = 68, 
  safe = 0, 
  weak = 0, 
  leaked = 0, 
  duplicate = 0 
}: { 
  score?: number;
  safe?: number;
  weak?: number;
  leaked?: number;
  duplicate?: number;
}) => {
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Data for segments with consistent colors - using actual counts
  const segments = [
    { value: safe, color: PASSWORD_COLORS.safe.primary, label: 'Safe' },
    { value: weak, color: PASSWORD_COLORS.weak.primary, label: 'Weak' },
    { value: leaked, color: PASSWORD_COLORS.leaked.primary, label: 'Leaked' },
    { value: duplicate, color: PASSWORD_COLORS.duplicate.primary, label: 'Duplicate' },
  ].filter(segment => segment.value > 0); // Only show segments with values

  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  
  // If no passwords, show a placeholder circle
  if (total === 0) {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Path
              d={createArcPath(center, center, radius, -90, 270)}
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.chartCenter}>
            <Text style={styles.scoreText}>0</Text>
            <Text style={styles.scoreLabel}>No Data</Text>
          </View>
        </View>
      </View>
    );
  }

  let currentAngle = -90; // Start from top

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((segment, index) => {
            const percentage = segment.value / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            return (
              <Path
                key={index}
                d={createArcPath(center, center, radius, startAngle, endAngle)}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeLinecap="round"
              />
            );
          })}
        </Svg>
        <View style={styles.chartCenter}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.scoreLabel}>Total Score</Text>
        </View>
      </View>
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <ThemedText style={styles.legendText}>{segment.label}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

// Category Card Component
const CategoryCard = ({
  icon,
  title,
  count,
  backgroundColor,
  iconColor,
  iconBg,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  count: number;
  backgroundColor: string;
  iconColor: string;
  iconBg: string;
  onPress?: () => void;
}) => {
  const CardContent = (
    <View style={[styles.categoryCard, { backgroundColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.categoryTextContainer}>
        <ThemedText style={styles.categoryTitle}>{title}</ThemedText>
        <ThemedText style={styles.categoryCount}>{count} Found</ThemedText>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [passwordStats, setPasswordStats] = useState({
    safe: 0,
    weak: 0,
    leaked: 0,
    duplicate: 0,
    total: 0,
  });

  useEffect(() => {
    analyzePasswords();
  }, []);

  const analyzePasswords = async () => {
    try {
      setLoading(true);
      const passwords = await passwordAPI.list();
      const vaultKey = await storageAPI.getVaultKey();
      
      if (!vaultKey) {
        console.error('Vault key not found');
        return;
      }

      const passwordCounts: { [key: string]: number } = {};
      let weakCount = 0;
      let safeCount = 0;

      // Decrypt all passwords and analyze
      for (const pwd of passwords) {
        try {
          const decrypted = await aesDecrypt(pwd.encrypted_password, vaultKey);
          
          // Count duplicates
          passwordCounts[decrypted] = (passwordCounts[decrypted] || 0) + 1;
          
          // Check strength
          const strength = validatePasswordStrength(decrypted);
          if (!strength.isStrong) {
            weakCount++;
          } else {
            safeCount++;
          }
        } catch (error) {
          console.error('Failed to decrypt password:', error);
        }
      }

      // Count duplicate passwords (passwords that appear more than once)
      let duplicateCount = 0;
      Object.values(passwordCounts).forEach(count => {
        if (count > 1) {
          duplicateCount += count; // Count all instances of duplicated passwords
        }
      });

      setPasswordStats({
        safe: safeCount,
        weak: weakCount,
        leaked: 0, // This will be updated when leaked passwords screen is opened
        duplicate: duplicateCount,
        total: passwords.length,
      });
    } catch (error: any) {
      console.error('Failed to analyze passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <ThemedText style={styles.headerTitle}>Password Health</ThemedText>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={{ marginTop: 16, color: '#666' }}>Analyzing passwords...</Text>
        </View>
      </ThemedView>
    );
  }

  const score = passwordStats.total > 0 
    ? Math.round((passwordStats.safe / passwordStats.total) * 100)
    : 0;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <ThemedText style={styles.headerTitle}>Password Health</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}>
        {/* Chart Card */}
        <View style={styles.chartCard}>
          <DonutChart 
            score={score} 
            safe={passwordStats.safe}
            weak={passwordStats.weak}
            leaked={passwordStats.leaked}
            duplicate={passwordStats.duplicate}
          />
        </View>

        {/* Category Cards */}
        <CategoryCard
          icon="check-circle"
          title="Safe Password"
          count={passwordStats.safe}
          backgroundColor={PASSWORD_COLORS.safe.light}
          iconColor={PASSWORD_COLORS.safe.primary}
          iconBg={PASSWORD_COLORS.safe.iconBg}
          onPress={() => router.push('/safe-passwords-list')}
        />
        <CategoryCard
          icon="refresh"
          title="Weak Password"
          count={passwordStats.weak}
          backgroundColor={PASSWORD_COLORS.weak.light}
          iconColor={PASSWORD_COLORS.weak.primary}
          iconBg={PASSWORD_COLORS.weak.iconBg}
          onPress={() => router.push('/weak-passwords-list')}
        />
        <CategoryCard
          icon="content-copy"
          title="Duplicate Password"
          count={passwordStats.duplicate}
          backgroundColor={PASSWORD_COLORS.duplicate.light}
          iconColor={PASSWORD_COLORS.duplicate.primary}
          iconBg={PASSWORD_COLORS.duplicate.iconBg}
          onPress={() => router.push('/duplicate-passwords-list')}
        />
        <CategoryCard
          icon="warning"
          title="Leak Password"
          count={passwordStats.leaked}
          backgroundColor={PASSWORD_COLORS.leaked.light}
          iconColor={PASSWORD_COLORS.leaked.primary}
          iconBg={PASSWORD_COLORS.leaked.iconBg}
          onPress={() => router.push('/leaked-passwords-list')}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#9333EA', // Purple color
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  chartWrapper: {
    width: 200,
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -2,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 64,
    width: '100%',
  },
  scoreLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
    width: '100%',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  categoryCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

