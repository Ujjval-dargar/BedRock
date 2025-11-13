import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface CategoryCard {
 title: string;
 count: string;
 backgroundColor: string;
 icon: keyof typeof MaterialIcons.glyphMap;
 secondaryIcon?: keyof typeof MaterialIcons.glyphMap;
}

const categories: CategoryCard[] = [
 {
  title: 'Browser',
  count: '129 Password',
  backgroundColor: '#6F6BF5',
  icon: 'public',
  secondaryIcon: 'search',
 },
  {
    title: 'Apps',
    count: '45 Password',
    backgroundColor: '#FDCD30',
    icon: 'phone-android',
  },
  {
    title: 'Card',
    count: '5 Details',
    backgroundColor: '#7CD4B2',
    icon: 'account-balance-wallet',
  },
];

export function CategoryCards() {
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    width: 140,
    height: 140,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    marginRight: 16,
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  count: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.95,
  },
});
