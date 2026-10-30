import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HomeIcon = require('@/assets/images/tabbar/home.png');
const HomeActiveIcon = require('@/assets/images/tabbar/home_active.png');
const CloneIcon = require('@/assets/images/tabbar/clone.png');
const CloneActiveIcon = require('@/assets/images/tabbar/clone_active.png');

type TabItem = {
  label: string;
  icon: number;
  activeIcon: number;
};

const TAB_CONFIG: Record<string, TabItem> = {
  index: { label: '首页', icon: HomeIcon, activeIcon: HomeActiveIcon },
  explore: { label: '克隆', icon: CloneIcon, activeIcon: CloneActiveIcon },
};

// 对应 Vue 版 136rpx（750 设计稿）=> 68px；图标 80rpx => 40px；圆角 60rpx => 30px
export const TAB_BAR_HEIGHT = 68;
const BAR_HEIGHT = TAB_BAR_HEIGHT;
const ICON_SIZE = 40;

/**
 * Android 的 BlurView 在启用新架构（Fabric）时会渲染成不透明白色，
 * 且不遵守父级圆角裁剪，导致圆角和半透明背景都看不到。
 * 因此只在 iOS 使用真实模糊，Android / Web 用半透明玻璃底板兜底。
 */
const USE_NATIVE_BLUR = Platform.OS === 'ios';

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    // bar 悬浮在安全区之上，与 Vue 版 bottom: env(safe-area-inset-bottom) 一致
    <View style={[styles.wrapper, { bottom: insets.bottom }]} pointerEvents="box-none">
      {/* 圆角裁剪必须由外层 View 完成，BlurView 只负责铺满 */}
      <View style={styles.barClip}>
        {USE_NATIVE_BLUR && (
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        )}
        <View style={styles.bar}>
          {state.routes.map((route, index) => {
            const config = TAB_CONFIG[route.name] ?? TAB_CONFIG.index;
            const focused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={config.label}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.item}>
                <Image
                  source={focused ? config.activeIcon : config.icon}
                  style={styles.icon}
                  contentFit="contain"
                  // 未选中：深色图标反相成白色并降低透明度（对应 Vue 的 filter: brightness(0) invert(1)）
                  tintColor={focused ? undefined : 'rgba(255, 255, 255, 0.5)'}
                />
                <Text style={[styles.label, focused && styles.labelActive]}>{config.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  // 圆角 + 半透明背景都画在这一层，自身背景会被圆角裁切
  barClip: {
    height: BAR_HEIGHT,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  item: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  label: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
