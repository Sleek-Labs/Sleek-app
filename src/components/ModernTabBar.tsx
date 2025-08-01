import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabItem {
  name: string;
  label: string;
  icon: (isSelected: boolean) => React.ReactNode;
  route: string;
}

// Custom Vector Icons
const HomeIcon = ({ isSelected }: { isSelected: boolean }) => (
  <View style={styles.iconContainer}>
    {/* House roof - orange */}
    <View style={[styles.roof, { backgroundColor: '#FF8C00' }]} />
    {/* House body - brown */}
    <View style={[styles.houseBody, { backgroundColor: '#8B4513' }]} />
    {/* Door - white */}
    <View style={[styles.door, { backgroundColor: '#FFFFFF' }]} />
  </View>
);

const OrdersIcon = ({ isSelected }: { isSelected: boolean }) => (
  <View style={styles.iconContainer}>
    {/* Clipboard board - brown */}
    <View style={[styles.clipboardBoard, { backgroundColor: '#8B4513' }]} />
    {/* Paper - white */}
    <View style={[styles.clipboardPaper, { backgroundColor: '#FFFFFF' }]} />
    {/* Lines on paper */}
    <View style={[styles.paperLine, { backgroundColor: '#DDDDDD' }]} />
    <View style={[styles.paperLine, { backgroundColor: '#DDDDDD' }, { top: 8 }]} />
    <View style={[styles.paperLine, { backgroundColor: '#DDDDDD' }, { top: 12 }]} />
  </View>
);

const DoneIcon = ({ isSelected }: { isSelected: boolean }) => (
  <View style={styles.iconContainer}>
    {/* Star - yellow */}
    <View style={[styles.star, { backgroundColor: '#FFD700' }]} />
  </View>
);

const MoreIcon = ({ isSelected }: { isSelected: boolean }) => (
  <View style={styles.iconContainer}>
    {/* Three dots */}
    <View style={[styles.dot, { backgroundColor: '#CCCCCC' }]} />
    <View style={[styles.dot, { backgroundColor: '#CCCCCC' }, { top: 4 }]} />
    <View style={[styles.dot, { backgroundColor: '#CCCCCC' }, { top: 8 }]} />
  </View>
);

const tabItems: TabItem[] = [
  { 
    name: 'home', 
    label: 'HOME', 
    icon: (isSelected: boolean) => <HomeIcon isSelected={isSelected} />, 
    route: '/tabs/home' 
  },
  { 
    name: 'sleek', 
    label: 'SLEEK', 
    icon: (isSelected: boolean) => <OrdersIcon isSelected={isSelected} />, 
    route: '/tabs/sleek' 
  },
  { 
    name: 'rewards', 
    label: 'REWARDS', 
    icon: (isSelected: boolean) => <DoneIcon isSelected={isSelected} />, 
    route: '/tabs/rewards' 
  },
  { 
    name: 'account', 
    label: 'MORE', 
    icon: (isSelected: boolean) => <MoreIcon isSelected={isSelected} />, 
    route: '/tabs/account' 
  },
];

const ModernTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.modernTabBar}>
      {tabItems.map((item) => {
        const isSelected = pathname === item.route;
        
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.tabItem}
            onPress={() => handleTabPress(item.route)}
          >
            <View style={[
              styles.tabIconContainer,
              isSelected && styles.tabIconSelected
            ]}>
              <View style={styles.iconCircle}>
                {item.icon(isSelected)}
              </View>
            </View>
            <Text style={[
              styles.tabLabel,
              isSelected && styles.tabLabelSelected
            ]}>
              {item.label}
            </Text>
            {isSelected && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  modernTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  tabIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#27272a',
  },
  tabIconSelected: {
    backgroundColor: '#9cf80f',
    borderColor: '#9cf80f',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  tabLabel: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
    marginTop: 4,
  },
  tabLabelSelected: {
    color: '#9cf80f',
    fontWeight: 'bold',
  },
  tabIndicator: {
    width: 6,
    height: 6,
    backgroundColor: '#9cf80f',
    borderRadius: 3,
    marginTop: 8,
  },
  // Vector Icon Styles
  iconContainer: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  // Home Icon Styles
  roof: {
    position: 'absolute',
    top: 1,
    left: 5,
    width: 14,
    height: 7,
    borderRadius: 1,
  },
  houseBody: {
    position: 'absolute',
    top: 8,
    left: 3,
    width: 18,
    height: 12,
    borderRadius: 1,
  },
  door: {
    position: 'absolute',
    top: 14,
    left: 8,
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  // Orders Icon Styles
  clipboardBoard: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 22,
    height: 22,
    borderRadius: 1,
  },
  clipboardPaper: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 18,
    height: 18,
    borderRadius: 1,
  },
  paperLine: {
    position: 'absolute',
    left: 7,
    width: 10,
    height: 1,
    borderRadius: 0.5,
  },
  // Done Icon Styles
  star: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  // More Icon Styles
  dot: {
    position: 'absolute',
    left: 10,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default ModernTabBar; 