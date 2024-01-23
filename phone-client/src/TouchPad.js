import React from "react";

import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export default function TouchPad({
  style,
  text,
  onBegin,
  onPan,
  onRelease,
  onTap,
}) {
  var longPressIntervalId;
  const startLongPress = (event) => {
    longPressIntervalId = setInterval(() => {
      onPan(event);
      onTap(event);
    }, 100);
  };
  const endLongPress = () => {
    clearInterval(longPressIntervalId);
  };
  const touchPadGestures = Gesture.Race(
    Gesture.LongPress().onStart(startLongPress).onEnd(endLongPress),
    Gesture.Tap().onBegin(onBegin).onEnd(onTap),
    Gesture.Pan().onBegin(onBegin).onUpdate(onPan).onEnd(onRelease)
  );
  return (
    <GestureDetector gesture={touchPadGestures}>
      <View style={[style]}>
        <Text>{text}</Text>
      </View>
    </GestureDetector>
  );
}
