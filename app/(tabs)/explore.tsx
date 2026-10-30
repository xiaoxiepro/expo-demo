import { Image } from 'expo-image';
import { Text, StyleSheet, View,useWindowDimensions } from 'react-native';

import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  const { width, height } = useWindowDimensions();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV;
  return (
    <View>
      <Text>屏幕宽度：{width}</Text>
      <Text>屏幕高度：{height}</Text>
      <View style={{
        width:"100%",
        height:20,
        backgroundColor:'red'
      }}>

      </View>
      <Text>当前环境：{appEnv || '未读取到'}</Text>
      <Text>接口地址：{apiUrl || '未读取到'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
