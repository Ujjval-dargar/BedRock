import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**
 * Get website icon configuration (image path, fallback icon, and color)
 * @param website - The website domain (e.g., 'snapchat.com', 'twitter.com')
 * @returns Object containing imagePath, fallback icon name, and brand color
 */
export const getWebsiteIcon = (
  website: string
): { imagePath?: string; icon?: keyof typeof MaterialIcons.glyphMap; color: string } => {
  const domain = website.toLowerCase().replace('.com', '').replace('.net', '').replace('.org', '');

  // Icon configuration with image paths, fallback icons, and brand colors
  const iconMap: Record<
    string,
    { imagePath?: string; icon?: keyof typeof MaterialIcons.glyphMap; color: string }
  > = {
    snapchat: { imagePath: 'icons/snapchat.png', icon: 'camera-alt', color: '#FFFC00' },
    twitter: { imagePath: 'icons/twitter.png', icon: 'chat-bubble-outline', color: '#1DA1F2' },
    facebook: { imagePath: 'icons/facebook.png', icon: 'facebook', color: '#1877F2' },
    instagram: { imagePath: 'icons/instagram.png', icon: 'photo-camera', color: '#E4405F' },
    linkedin: { imagePath: 'icons/linkedin.png', icon: 'work', color: '#0077B5' },
    yahoo: { imagePath: 'icons/yahoo.png', icon: 'email', color: '#6001D2' },
    dropbox: { imagePath: 'icons/dropbox.png', icon: 'cloud', color: '#0061FF' },
    adobe: { imagePath: 'icons/adobe.png', icon: 'palette', color: '#FF0000' },
    ebay: { imagePath: 'icons/ebay.png', icon: 'shopping-cart', color: '#E53238' },
    myspace: { imagePath: 'icons/myspace.png', icon: 'people', color: '#008DE4' },
    tumblr: { imagePath: 'icons/tumblr.png', icon: 'article', color: '#36465D' },
    pinterest: { imagePath: 'icons/pinterest.png', icon: 'bookmark', color: '#BD081C' },
    google: { imagePath: 'icons/google.png', icon: 'search', color: '#4285F4' },
    amazon: { imagePath: 'icons/amazon.png', icon: 'shopping-bag', color: '#FF9900' },
    netflix: { imagePath: 'icons/netflix.png', icon: 'movie', color: '#E50914' },
    github: { imagePath: 'icons/github.png', icon: 'code', color: '#181717' },
  };

  return iconMap[domain] || { icon: 'language', color: '#6B7280' };
};

/**
 * Icon image mapping for local assets
 * Place icons in: BedRock/assets/images/icons/
 */
export const iconImageMap: Record<string, any> = {
  snapchat: require('@/assets/images/icons/snapchat.png'),
  twitter: null, // require('@/assets/images/icons/twitter.png'),
  facebook: null, // require('@/assets/images/icons/facebook.png'),
  instagram: null, // require('@/assets/images/icons/instagram.png'),
  linkedin: null, // require('@/assets/images/icons/linkedin.png'),
  yahoo: null, // require('@/assets/images/icons/yahoo.png'),
  dropbox: null, // require('@/assets/images/icons/dropbox.png'),
  adobe: null, // require('@/assets/images/icons/adobe.png'),
  ebay: null, // require('@/assets/images/icons/ebay.png'),
  myspace: null, // require('@/assets/images/icons/myspace.png'),
  tumblr: null, // require('@/assets/images/icons/tumblr.png'),
  pinterest: null, // require('@/assets/images/icons/pinterest.png'),
  google: null, // require('@/assets/images/icons/google.png'),
  amazon: null, // require('@/assets/images/icons/amazon.png'),
  netflix: null, // require('@/assets/images/icons/netflix.png'),
  github: null, // require('@/assets/images/icons/github.png'),
};
