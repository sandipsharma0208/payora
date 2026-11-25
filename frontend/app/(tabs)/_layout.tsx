import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabItemWrapper, focused && styles.activePill]}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={21}
                color={focused ? '#111111' : '#6B7280'}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}>
              Home
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="my-payora"
        options={{
          title: 'My Payora',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItemWrapper, focused && styles.activePill]}>
              <Ionicons
                name={focused ? 'wallet' : 'wallet-outline'}
                size={21}
                color={focused ? Colors.primary : color}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}>
              My Payora
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="scan-qr"
        options={{
          title: 'Scan QR',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItemWrapper, focused && styles.activePill]}>
              <Ionicons
                name={focused ? 'qr-code' : 'qr-code-outline'}
                size={21}
                color={focused ? Colors.primary : color}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}>
              Scan QR
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItemWrapper, focused && styles.activePill]}>
              <Ionicons
                name={focused ? 'mail' : 'mail-outline'}
                size={21}
                color={focused ? Colors.primary : color}
              />
              <View style={styles.inboxBadge}>
                <Text style={styles.inboxBadgeText}>1</Text>
              </View>
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}>
              Inbox
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: '#6B7280',
    fontWeight: '500',
  },
  tabItemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 16,
  },
  activePill: {
    backgroundColor: '#FDE8EE',
  },
  inboxBadge: {
    position: 'absolute',
    top: 0,
    right: 4,
    backgroundColor: '#E11D48',
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  inboxBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
