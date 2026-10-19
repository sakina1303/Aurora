import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

const shades = ['#B88B78', '#D8B2A9', '#91A994', '#D8C395', '#E8DDD1', '#8A695A'];
const pieces = Array.from({ length: 48 }, (_, index) => {
  const angle = (index / 48) * Math.PI * 2;
  const distance = 76 + ((index * 37) % 105);
  return {
    angle,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance + 42,
    color: shades[index % shades.length],
    size: index % 5 === 0 ? 9 : 6,
    rotation: index % 2 ? '300deg' : '-320deg',
  };
});

const CelebrationBurst = forwardRef(function CelebrationBurst({ originY = 300 }, ref) {
  const { width } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    start() {
      progress.stopAnimation();
      progress.setValue(0);
      setVisible(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 1150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setVisible(false));
    },
  }), [progress]);

  if (!visible) return null;
  return <View pointerEvents="none" style={styles.overlay} accessibilityElementsHidden>
    {pieces.map((piece, index) => <Animated.View key={index} style={{
      position: 'absolute',
      left: width / 2 - piece.size / 2,
      top: originY,
      width: piece.size,
      height: index % 4 === 0 ? piece.size : piece.size * 1.7,
      borderRadius: index % 4 === 0 ? piece.size / 2 : 2,
      backgroundColor: piece.color,
      opacity: progress.interpolate({ inputRange: [0, 0.08, 0.62, 1], outputRange: [0, 1, 1, 0] }),
      transform: [
        { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, piece.x] }) },
        { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, piece.y] }) },
        { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', piece.rotation] }) },
      ],
    }} />)}
  </View>;
});

const styles = StyleSheet.create({ overlay: { ...StyleSheet.absoluteFillObject, zIndex: 20, elevation: 20 } });

export default CelebrationBurst;
