import React from 'react';
import { View } from 'react-native';

export default function GradientView({ colors, style, children, ...props }) {
  return (
    <View style={[{ backgroundColor: colors[0] }, style]} {...props}>
      {children}
    </View>
  );
}
