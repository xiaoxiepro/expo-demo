import AsyncStorage from '@react-native-async-storage/async-storage';

// 保存数据
export async function setStorage<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// 读取数据
export async function getStorage<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);

  if (value === null) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

// 删除数据
export async function removeStorage(key: string) {
  await AsyncStorage.removeItem(key);
}