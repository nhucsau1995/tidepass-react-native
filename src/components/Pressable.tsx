import { useRef, type ReactNode } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

// Pressable with a short spring scale, used by every tappable surface.
export function ScalePressable({
  children,
  style,
  containerStyle,
  scaleTo = 0.97,
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & { children: ReactNode; style?: StyleProp<ViewStyle>; containerStyle?: StyleProp<ViewStyle>; scaleTo?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable {...rest} onPressIn={() => to(scaleTo)} onPressOut={() => to(1)} style={containerStyle}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
