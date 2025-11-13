import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState, type ComponentProps } from 'react';
import {
  SafeAreaView,
  ScrollView,
  export { default } from '../passwords';
 
};

const withAlpha = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const PasswordCard = ({ item }: { item: PasswordItem }) => {
  const IconComponent = ICON_COMPONENTS[item.icon.family];
  const isWarning = item.status === 'warning';
  const statusLabel = isWarning ? 'Action Needed' : 'Secure';
  const statusIconColor = isWarning ? '#DC2626' : '#0F766E';
  const meterActiveSegments = isWarning ? 2 : 4;

  return (
    <View style={[styles.cardWrapper, { shadowColor: withAlpha(item.iconColor, 0.4) }]}>
      <View
        style={[
          styles.card,
          {
            borderColor: withAlpha(item.iconColor, 0.25),
            backgroundColor: withAlpha('#FFFFFF', 0.92),
          },
        ]}>
        <View style={[styles.cardAccentBar, { backgroundColor: withAlpha(item.iconColor, 0.45) }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.cardAvatar,
                {
                  borderColor: withAlpha(item.iconColor, 0.35),
                  backgroundColor: withAlpha(item.iconColor, 0.12),
                },
              ]}>
              <IconComponent name={item.icon.name} size={22} color={item.iconColor} />
            </View>

            <View style={styles.cardTextBlock}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.email}</Text>
            </View>

            <View style={[styles.cardStatusPill, isWarning ? styles.cardStatusPillWarning : styles.cardStatusPillSafe]}>
              {isWarning ? (
                <MaterialCommunityIcons name="alert-circle" size={14} color={statusIconColor} />
              ) : (
                <Ionicons name="shield-checkmark" size={14} color={statusIconColor} />
              )}
              <Text style={[styles.cardStatusPillText, isWarning ? styles.cardStatusPillTextWarning : styles.cardStatusPillTextSafe]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <View style={styles.cardTagRow}>
              {item.categories.map((category) => (
                <View
                  key={category}
                  style={[
                    styles.cardTag,
                    {
                      borderColor: withAlpha(item.iconColor, 0.25),
                      backgroundColor: withAlpha(item.iconColor, 0.12),
                    },
                  ]}>
                  <Text style={[styles.cardTagText, { color: withAlpha(item.iconColor, 0.85) }]}>{category}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardMeter}>
              {Array.from({ length: 4 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.cardMeterSegment,
                    index < meterActiveSegments && {
                      backgroundColor: isWarning ? '#FB923C' : withAlpha(item.iconColor, 0.85),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function PasswordsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('Browsers');

  const totalSaved = passwordItems.length;
  const weakPasswords = passwordItems.filter((item) => item.status === 'warning').length;
  const isVaultHealthy = weakPasswords === 0;

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') {
      return passwordItems;
    }
    return passwordItems.filter((item) => item.categories.includes(selectedCategory));
  }, [selectedCategory]);

  const grouped = useMemo(() => groupBySection(filteredItems), [filteredItems]);
  const highlightItems = grouped['__top__'] ?? [];
  const sections = Object.entries(grouped).filter(([key]) => key !== '__top__');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <TouchableOpacity activeOpacity={0.85} style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.pageTitle}>Passwords</Text>
            <Text style={styles.pageSubtitle}>Audit and manage your saved logins</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.overviewCard}>
          <View>
            <Text style={styles.overviewTitle}>Your Vault</Text>
            <Text style={styles.overviewSubtitle}>
              {totalSaved} saved · {weakPasswords} need attention
            </Text>
          </View>
          <View
            style={[
              styles.overviewBadge,
              isVaultHealthy ? styles.overviewBadgeSafe : styles.overviewBadgeWarning,
            ]}>
            <Ionicons
              name={isVaultHealthy ? 'shield-checkmark' : 'warning-outline'}
              size={18}
              color={isVaultHealthy ? '#2563EB' : '#DC2626'}
            />
            <Text
              style={[
                styles.overviewBadgeText,
                isVaultHealthy ? styles.overviewBadgeTextSafe : styles.overviewBadgeTextWarning,
              ]}>
              {isVaultHealthy ? 'All good' : 'Action needed'}
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#6F6BF5" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Your Password"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.filterRow}>
            {categories.map((category) => {
              const isActive = category === selectedCategory;
              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(category)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {highlightItems.map((item) => (
            <View key={item.id} style={styles.highlightWrapper}>
              <PasswordCard item={item} />
            </View>
          ))}

          {sections.map(([sectionTitle, items]) => (
            <View key={sectionTitle} style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>{sectionTitle}</Text>
              {items.map((item) => (
                <View key={item.id} style={styles.sectionCardWrapper}>
                  <PasswordCard item={item} />
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F5FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#F4F5FF',
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  headerSpacer: {
    width: 40,
  },
  overviewCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 4,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  overviewSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
  },
  overviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },
  overviewBadgeSafe: {
    backgroundColor: '#EFF6FF',
  },
  overviewBadgeWarning: {
    backgroundColor: '#FEE2E2',
  },
  overviewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  overviewBadgeTextSafe: {
    color: '#1D4ED8',
  },
  overviewBadgeTextWarning: {
    color: '#B91C1C',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginBottom: 16,
    shadowColor: '#4338CA',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  scrollContent: {
    paddingBottom: 56,
    paddingTop: 12,
    gap: 28,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 0,
  },
  filterChip: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  filterChipActive: {
    backgroundColor: '#4C1D95',
    borderWidth: 0,
    shadowColor: '#4C1D95',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  highlightWrapper: {
    marginTop: 20,
  },
  sectionBlock: {
    marginTop: 26,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionCardWrapper: {
    marginBottom: 16,
  },
  cardWrapper: {
    borderRadius: 22,
    shadowColor: '#1F2937',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 4,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardAccentBar: {
    height: 4,
    width: '100%',
  },
  cardBody: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardAvatar: {
    height: 46,
    width: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardTextBlock: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#475569',
  },
  cardStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  cardStatusPillWarning: {
    backgroundColor: '#FEE2E2',
  },
  cardStatusPillSafe: {
    backgroundColor: '#DCFCE7',
  },
  cardStatusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardStatusPillTextWarning: {
    color: '#B91C1C',
  },
  cardStatusPillTextSafe: {
    color: '#047857',
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  cardTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  cardTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4338CA',
  },
  cardMeter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMeterSegment: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
});
