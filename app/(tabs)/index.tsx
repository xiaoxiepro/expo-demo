import { Link } from 'expo-router';
import { ImageSourcePropType, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import ImageViewer from '@/components/ImageViewer';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import CircleButton from '@/components/CircleButton';
import EmojiPicker from '@/components/EmojiPicker';
import EmojiList from '@/components/EmojiList';
import EmojiSticker from '@/components/EmojiSticker';
import { TAB_BAR_HEIGHT } from '@/components/TabBar';

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function HomeScreen() {

  const insets = useSafeAreaInsets();
  const [permissionResponse, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType | undefined>(undefined);
  const imageRef = useRef<View>(null);

  useEffect(() => {
    if (!permissionResponse?.granted) {
      requestPermission();
    }
  }, [])



  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // 选择的媒体类型：images 图片、videos 视频
      allowsEditing: true, // 是否允许编辑/裁剪图片
      quality: 1, // 图片质量，范围 0 ~ 1，1 表示最高质量
      // aspect: [1, 1], // 裁剪比例，例如 [1, 1] 表示正方形
      // allowsMultipleSelection: false, // 是否允许选择多张图片
      // selectionLimit: 1, // 最大选择数量
      // orderedSelection: false, // 多选时是否按照用户选择的顺序返回
      // base64: false, // 是否返回 Base64 数据
      // exif: false, // 是否返回图片 EXIF 信息
    });
    // {
    //   "assets": [
    //     {
    //       "assetId": "99D53A1F-FEEF-40E1-8BB3-7DD55A43C8B7/L0/001",
    //       "base64": null,
    //       "duration": null,
    //       "exif": null,
    //       "fileName": "IMG_0004.JPG",
    //       "fileSize": 2548364,
    //       "height": 1669,
    //       "mimeType": "image/jpeg",
    //       "type": "image",
    //       "uri": "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FStickerSmash-13f21121-fc9d-4ec6-bf89-bf7d6165eb69/ImagePicker/ea574eaa-f332-44a7-85b7-99704c22b402.jpeg",
    //       "width": 1668
    //     }
    //   ],
    //   "canceled": false
    // }
    if (!result.canceled) {
      console.log(result);
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
    } else {
      alert('You did not select any image.');
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    try {
      const localUri = await captureRef(imageRef, {
        height: 440,
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);
      if (localUri) {
        alert('Saved!');
      }
    } catch (e) {
      console.log(e);
    }
  };



  return (
    <GestureHandlerRootView
      style={[styles.container, { paddingBottom: TAB_BAR_HEIGHT + insets.bottom }]}>
      <View style={styles.ImageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
          {pickedEmoji && <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />}
        </View>
      </View>

      {
        showAppOptions ? (
          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              <IconButton icon="refresh" label="Reset" onPress={onReset} />
              <CircleButton onPress={onAddSticker} />
              <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
            </View>
          </View>
        ) : (
          <View style={styles.footerContainer}>
            <Button theme="primary" label='Choose a photo' onPress={pickImageAsync} />
            <Button label='Use this photo' onPress={() => setShowAppOptions(true)} />
          </View>
        )
      }

      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        {/* Emoji list component will go here */}
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  ImageContainer: {
    flex: 1
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center'
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
