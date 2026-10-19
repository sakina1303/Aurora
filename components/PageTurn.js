import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';

// The outgoing page stays visible through the first half of the turn. Its paper
// back is visible during the second half, with the destination page underneath.
export default function PageTurn({ from, to, direction = 'forward', onFinished }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const progress = useRef(new Animated.Value(0)).current;
  const finishRef = useRef(onFinished);
  finishRef.current = onFinished;

  useEffect(() => {
    let active = true;
    let animation;
    AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!active) return;
      animation = Animated.timing(progress, {
        toValue: 1,
        duration: reduced ? 120 : 720,
        useNativeDriver: true,
      });
      animation.start(({ finished }) => { if (finished && active) finishRef.current?.(); });
    }).catch(() => {
      if (!active) return;
      animation = Animated.timing(progress, { toValue: 1, duration: 720, useNativeDriver: true });
      animation.start(({ finished }) => { if (finished && active) finishRef.current?.(); });
    });
    return () => { active = false; animation?.stop(); };
  }, [progress]);

  const clockwise = direction === 'forward';
  const rotateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', clockwise ? '-180deg' : '180deg'],
  });
  const frontOpacity = progress.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = progress.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] });

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.book}>
        <View style={StyleSheet.absoluteFill}>{to}</View>
        <Animated.View style={[styles.turningPage, {
          transformOrigin: clockwise ? 'left center' : 'right center',
          transform: [{ perspective: 1000 }, { rotateY }],
        }]}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: frontOpacity }]}>{from}</Animated.View>
          <Animated.View style={[styles.back, { opacity: backOpacity }]}>
            <View style={styles.backRule} />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const createStyles = colors => StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  book: { flex: 1 },
  turningPage: { ...StyleSheet.absoluteFillObject, backfaceVisibility: 'visible' },
  back: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.paperEdge, borderRadius: 12, transform: [{ rotateY: '180deg' }], justifyContent: 'flex-start', padding: 20 },
  backRule: { height: 1, backgroundColor: colors.line },
});
