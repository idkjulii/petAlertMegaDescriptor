import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#999999',
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderTopColor: isDark ? '#38383A' : '#E5E5E7',
          borderTopWidth: 0.5,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderBottomColor: isDark ? '#38383A' : '#E5E5E7',
          borderBottomWidth: 0.5,
        },
        headerTintColor: isDark ? '#FFFFFF' : '#000000',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
          headerTitle: '🐾 Pet Finder',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
      
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document" size={size} color={color} />
          ),
          headerTitle: 'Mis Reportes',
        }}
      />
      
      <Tabs.Screen
        name="pets"
        options={{
          title: 'Mascotas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="paw" size={size} color={color} />
          ),
          headerTitle: 'Mis Mascotas',
        }}
      />
      
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message" size={size} color={color} />
          ),
          headerTitle: 'Mensajes',
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
          headerTitle: 'Mi Perfil',
        }}
      />
    </Tabs>
  );
}

