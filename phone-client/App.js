import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import { StyleSheet, Vibration, View, useWindowDimensions } from "react-native";
import { GestureHandlerRootView, State } from "react-native-gesture-handler";
import { io } from "socket.io-client";
import TouchPad from "./components/TouchPad";

import { LogBox } from "react-native";
import ServerAddressInput from "./components/ServerAddressInput";
import SessionStartInput from "./components/SessionStartInput";
LogBox.ignoreLogs(["new NativeEventEmitter()"]); // Ignore log notification by message

export default function App() {
  const { height, width } = useWindowDimensions();
  const [touchMode, setTouchMode] = useState(true);
  const [absoluteMode, setAbsoluteMode] = useState(false);
  const [serverAddress, setServerAddress] = useState("");
  const [displayStart, setDisplayStart] = useState(false);
  const [socket, setSocket] = useState(null);

  const singleHorizontalMultiplier = 150;
  const singleVerticalMultiplier = 300;

  // MARK: multipliers
  const doubleHorizontalMultiplier = 175;
  const doubleVerticalMultipler = 200;

  // MARK: translation values
  var leftOffsetX = 0,
    leftOffsetY = 0;
  var rightOffsetX = 0,
    rightOffsetY = 0;

  const vibrationDuration = 50;

  useEffect(() => {
    if (socket) socket.close;

    const newSocket = io("http://" + serverAddress + ":10942", {
      extraHeaders: {
        ["client-type"]: "remote",
      },
      transports: ["websocket"],
    });
    newSocket.on("set-mode", async function (single) {
      setTouchMode(single);
    });
    newSocket.on("set-absolute", async function (absolute) {
      setAbsoluteMode(absolute);
    });
    newSocket.on("hide-timer-button", (hidden) => {
      setDisplayStart(!hidden);
    });
    newSocket.on("connect", () => {
      setSocket(newSocket);
    });
    newSocket.on("disconnect", () => {
      setServerAddress(null);
    });
  }, [serverAddress]);

  const onPan = (event, left, offsetx, offsety) => {
    console.log(left, (event.x / width) * 100, (event.y / height) * 100);
    const xMultiplier = touchMode
      ? singleHorizontalMultiplier
      : doubleHorizontalMultiplier;
    const yMultiplier = touchMode
      ? singleVerticalMultiplier
      : doubleVerticalMultipler;
    if (absoluteMode) {
      socket.emit(
        "cursor-set",
        left,
        (event.x / width) * xMultiplier + offsetx,
        (event.y / height) * yMultiplier + offsety
      );
    } else {
      const deltaX =
        (event.translationX - (left ? leftOffsetX : rightOffsetX)) / width;
      const deltaY =
        (event.translationY - (left ? leftOffsetY : rightOffsetY)) / height;

      console.log(left, deltaX * xMultiplier, deltaY * yMultiplier);
      socket.emit(
        "cursor-move",
        left,
        deltaX * xMultiplier,
        deltaY * yMultiplier
      );

      if (left)
        (leftOffsetX = event.translationX), (leftOffsetY = event.translationY);
      else
        (rightOffsetX = event.translationX),
          (rightOffsetY = event.translationY);
    }
  };

  const onBegin = (event, left, offsetx, offsety) => {
    socket.emit("activate", left);
    onPan(event, left, offsetx, offsety);
  };

  const onBeginSingle = (event) => {
    onBegin(event, true, -25, -105);
  };

  const onBeginLeft = (event) => {
    onBegin(event, true, -10, -47);
  };

  const onBeginRight = (event) => {
    onBegin(event, false, 23, -47);
  };

  const onPanSingle = (event) => {
    onPan(event, true, -25, -105);
  };

  const onPanLeft = (event) => {
    onPan(event, true, -10, -47);
  };

  const onPanRight = (event) => {
    onPan(event, false, 23, -47);
  };

  const onReleaseLeft = (event) => {
    if (event.state === State.END) {
      if (absoluteMode) {
        Vibration.vibrate(vibrationDuration);
        socket.emit("click", true);
      } else {
        (leftOffsetX = 0), (leftOffsetY = 0);
      }
    }
  };

  const onReleaseRight = (event) => {
    if (event.state === State.END) {
      if (absoluteMode) {
        Vibration.vibrate(vibrationDuration);
        socket.emit("click", false);
      } else {
        (rightOffsetX = 0), (rightOffsetY = 0);
      }
    }
  };

  const onTapLeft = (event) => {
    Vibration.vibrate(vibrationDuration);
    socket.emit("click", true);
  };

  const onTapRight = (event) => {
    Vibration.vibrate(vibrationDuration);
    socket.emit("click", false);
  };

  const onStartSession = (event) => {
    console.log("starting session");
    socket.emit("start-session");
  };

  if (touchMode) {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  } else {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }

  return (
    <GestureHandlerRootView style={styles.view}>
      {!socket && (
        <ServerAddressInput
          style={styles.dialogContainer}
          isVisible={!socket}
          onSave={(address) => setServerAddress(address)}
        />
      )}
      {socket && displayStart &&
        <SessionStartInput 
          style={styles.dialogContainer}
          onClick={onStartSession}
        />
      }
      {socket && !displayStart &&
        (touchMode ? (
          <TouchPad
            style={styles.touchPadSingle}
            text={"CENTER"}
            onBegin={onBeginSingle}
            onPan={onPanSingle}
            onRelease={onReleaseLeft}
            onTap={onTapLeft}
          />
        ) : (
          <View style={{ flex: 1, flexDirection: "row" }}>
            <TouchPad
              style={styles.touchPadLeft}
              text={"LEFT"}
              onBegin={onBeginLeft}
              onPan={onPanLeft}
              onRelease={onReleaseLeft}
              onTap={onTapLeft}
            />
            <TouchPad
              style={styles.touchPadRight}
              text={"RIGHT"}
              onBegin={onBeginRight}
              onPan={onPanRight}
              onRelease={onReleaseRight}
              onTap={onTapRight}
            />
          </View>
        ))}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: "#363636",
    flex: 1,
  },
  touchPadSingle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(116, 246, 246, 0.7)",
  },
  touchPadLeft: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(116, 246, 246, 0.7)",
  },
  touchPadRight: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(235, 107, 126, 0.7)",
  },
  dialogContainer: {
    color: "#FFFFFF",
    backgroundColor: "#363636",
  },
});
