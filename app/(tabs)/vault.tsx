import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PasswordItem = {
  id: string;
  name: string;
  email: string;
  category: string;
  icon: string;
  iconColor: string;
  status?: 'warning' | 'safe';
};

const passwordItems: PasswordItem[] = [
  {
    id: 'google',
    name: 'Google',
    email: 'TheFather32@gmail.com',
    category: 'Browser',
    icon: 'google',
    iconColor: '#EA4335',
    status: 'warning',
  },
  {
    id: 'snapchat',
    name: 'SnapChat',
    email: 'TheFather32@gmail.com',
    category: 'Social',
    icon: 'snapchat-ghost',
    iconColor: '#FFFC00',
    status: 'safe',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    email: 'TheFather32@gmail.com',
    category: 'Social',
    icon: 'twitter',
    iconColor: '#1DA1F2',
    status: 'safe',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    email: 'TheFather32@gmail.com',
    category: 'Work',
    icon: 'linkedin',
    iconColor: '#0A66C2',
    status: 'safe',
  },
  {
    id: 'github',
    name: 'GitHub',
    email: 'developer@email.com',
    category: 'Work',
    icon: 'github',
    iconColor: '#333333',
    status: 'safe',
  },
  {
    id: 'visa',
    name: 'Visa Card',
    email: '•••• 3271',
    category: 'Card',
    icon: 'credit-card',
    iconColor: '#1A1F71',
    status: 'safe',
  },
];

const categories = ['All', 'Browser', 'Social', 'Work', 'Card'];

const PasswordCard = ({ item, onPress }: { item: PasswordItem; onPress: () => void }) => {
  const isWarning = item.status === 'warning';
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.cardIconContainer, { backgroundColor: `${item.iconColor}15` }]}>
        <FontAwesome name={item.icon as any} size={24} color={item.iconColor} />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {isWarning && (
            <View style={styles.warningBadge}>
              <Ionicons name="warning" size={12} color="#DC2626" />
            </View>
          )}
        </View>
        <Text style={styles.cardEmail}>{item.email}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={styles.strengthIndicator}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  i <= (isWarning ? 2 : 4) && {
                    backgroundColor: isWarning ? '#F59E0B' : '#10B981',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const StatCard = ({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function VaultScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = passwordItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPasswords = passwordItems.length;
  const weakPasswords = passwordItems.filter((item) => item.status === 'warning').length;
  const strongPasswords = totalPasswords - weakPasswords;

  const handlePasswordPress = (id: string) => {
    router.push(`/view-password-details?id=${id}` as any);
  };

  const handleAddPassword = () => {
    router.push('/add-password' as any);
  };

  const SAView: any = SafeAreaView;

  return (
    <SAView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={styles.headerTitle}>My Vault</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPassword}>
          <Ionicons name="add-circle" size={28} color="#6B5BFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard icon="key" value={`${totalPasswords}`} label="Total" color="#6B5BFF" />
          <StatCard icon="shield-checkmark" value={`${strongPasswords}`} label="Strong" color="#10B981" />
          <StatCard icon="warning" value={`${weakPasswords}`} label="Weak" color="#F59E0B" />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search passwords..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/shared-passwords-list' as any)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="share-social" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Shared</Text>
              <Text style={styles.quickActionSubtitle}>View shared passwords</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/weak-passwords-list' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Weak Passwords</Text>
              <Text style={styles.quickActionSubtitle}>{weakPasswords} need attention</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* Passwords List */}
        <View style={styles.passwordsSection}>
          <Text style={styles.sectionTitle}>
            All Passwords ({filteredItems.length})
          </Text>
          
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <PasswordCard
                key={item.id}
                item={item}
                onPress={() => handlePasswordPress(item.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No passwords found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try a different search term' : 'Add your first password to get started'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SAView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F6FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
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
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#6B5BFF',
    borderColor: '#6B5BFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  quickActions: {
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  passwordsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  warningBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  cardEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: '#F0EDFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B5BFF',
  },
  strengthIndicator: {
    flexDirection: 'row',
    gap: 3,
  },
  strengthBar: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
