import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { passwordAPI } from '../utils/api';

interface CategoryCard {
 title: string;
 count: string;
 backgroundColor: string;
 icon: keyof typeof MaterialIcons.glyphMap;
 secondaryIcon?: keyof typeof MaterialIcons.glyphMap;
}

export function CategoryCards() {
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPasswordCounts();
  }, []);

  const fetchPasswordCounts = async () => {
    try {
      setLoading(true);
      const passwords = await passwordAPI.list();
      
      // Count passwords by category
      const categoryCounts = {
        Browser: 0,
        Social: 0,
        Work: 0,
        Card: 0,
        Email: 0,
        Other: 0,
      };

      passwords.forEach((pwd) => {
        const category = pwd.category || 'Other';
        if (category in categoryCounts) {
          categoryCounts[category as keyof typeof categoryCounts]++;
        } else {
          categoryCounts.Other++;
        }
      });
      
      setCategories([
        {
          title: 'Browser',
          count: `${categoryCounts.Browser} Password${categoryCounts.Browser !== 1 ? 's' : ''}`,
          backgroundColor: '#3B82F6',
          icon: 'public',
        },
        {
          title: 'Social',
          count: `${categoryCounts.Social} Password${categoryCounts.Social !== 1 ? 's' : ''}`,
          backgroundColor: '#EC4899',
          icon: 'people',
        },
        {
          title: 'Work',
          count: `${categoryCounts.Work} Password${categoryCounts.Work !== 1 ? 's' : ''}`,
          backgroundColor: '#8B5CF6',
          icon: 'business-center',
        },
        {
          title: 'Card',
          count: `${categoryCounts.Card} Password${categoryCounts.Card !== 1 ? 's' : ''}`,
          backgroundColor: '#10B981',
          icon: 'account-balance-wallet',
        },
        {
          title: 'Email',
          count: `${categoryCounts.Email} Password${categoryCounts.Email !== 1 ? 's' : ''}`,
          backgroundColor: '#F59E0B',
          icon: 'email',
        },
        {
          title: 'Other',
          count: `${categoryCounts.Other} Password${categoryCounts.Other !== 1 ? 's' : ''}`,
          backgroundColor: '#6B7280',
          icon: 'apps',
        },
      ]);
    } catch (error: any) {
      console.error('Failed to fetch password counts:', error);
      // Show default values on error
      setCategories([
        {
          title: 'Browser',
          count: '0 Password',
          backgroundColor: '#3B82F6',
          icon: 'public',
        },
        {
          title: 'Social',
          count: '0 Password',
          backgroundColor: '#EC4899',
          icon: 'people',
        },
        {
          title: 'Work',
          count: '0 Password',
          backgroundColor: '#8B5CF6',
          icon: 'business-center',
        },
        {
          title: 'Card',
          count: '0 Password',
          backgroundColor: '#10B981',
          icon: 'account-balance-wallet',
        },
        {
          title: 'Email',
          count: '0 Password',
          backgroundColor: '#F59E0B',
          icon: 'email',
        },
        {
          title: 'Other',
          count: '0 Password',
          backgroundColor: '#6B7280',
          icon: 'apps',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6F6BF5" />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category, index) => (
        <View
          key={index}
          style={[styles.card, { backgroundColor: category.backgroundColor }]}
        >
          <View style={styles.iconWrapper}>
            {category.secondaryIcon ? (
              <View style={styles.iconContainer}>
                <MaterialIcons name={category.icon} size={32} color="#FFFFFF" />
                <View style={styles.secondaryIconContainer}>
                  <MaterialIcons name={category.secondaryIcon} size={16} color="#FFFFFF" />
                </View>
              </View>
            ) : (
              <MaterialIcons name={category.icon} size={36} color="#FFFFFF" />
            )}
          </View>
          <View>
            <Text style={styles.title}>{category.title}</Text>
            <Text style={styles.count}>{category.count}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  card: {
    width: 150,
    height: 150,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrapper: {
    marginBottom: 12,
  },
  iconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryIconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  count: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '500',
  },
});
