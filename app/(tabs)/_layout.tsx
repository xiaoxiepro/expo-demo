import { Tabs } from 'expo-router';
import React from 'react';

import TabBar from '@/components/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      // 自定义 tabBar：还原 xintianyou 项目的毛玻璃样式，路由跳转逻辑不变
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerTintColor: 'red',
        headerShadowVisible: false,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />
    </Tabs>
  );
}
