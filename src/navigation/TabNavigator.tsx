import React, { memo, useCallback, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import TripsScreen from '../screens/TripsScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type TabParamList = {
  Home: undefined;
  Trips: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabNavigatorProps {
  updateUserToken: (token: string | null) => void;
}

const tabIcons = {
  Home: {
    component: Ionicons,
    active: 'home',
    inactive: 'home-outline',
  },
  Trips: {
    component: MaterialIcons,
    active: 'local-shipping',
    inactive: 'local-shipping',
  },
  Profile: {
    component: Ionicons,
    active: 'person',
    inactive: 'person-outline',
  },
} as const;

const TabBarIcon = memo(
  ({
    routeName,
    focused,
    color,
    size,
  }: {
    routeName: keyof typeof tabIcons;
    focused: boolean;
    color: string;
    size: number;
  }) => {
    const iconConfig = tabIcons[routeName];
    const IconComponent = iconConfig.component;
    const iconName = focused ? iconConfig.active : iconConfig.inactive;

    return <IconComponent name={iconName} size={size} color={color} />;
  },
);

const TabNavigator = ({ updateUserToken }: TabNavigatorProps) => {
  const renderProfileScreen = useCallback(
    (props: any) => (
      <ProfileScreen {...props} updateUserToken={updateUserToken} />
    ),
    [updateUserToken],
  );

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
    }),
    [],
  );

  const tabBarLabelStyle = useMemo(
    () => ({
      fontSize: 12,
      fontWeight: '500' as const,
    }),
    [],
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle,
        tabBarLabelStyle,
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon
            routeName={route.name as keyof typeof tabIcons}
            focused={focused}
            color={color}
            size={size}
          />
        ),
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#8e8e93',
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="Trips"
        component={TripsScreen}
        options={{
          title: 'My Trips',
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          title: 'Profile',
        }}
      >
        {renderProfileScreen}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default TabNavigator;
