import React, { useState } from "react";
import Dialog from "react-native-dialog";

export default function ServerAddressInput({ style, isVisible, onSave }) {
  const [address, setAddress] = useState("");

  const handleSave = () => {
    onSave(address);
  };

  return (
    <Dialog.Container contentStyle={style} visible={isVisible}>
      <Dialog.Title style={style}>Enter Server Address</Dialog.Title>
      <Dialog.Input
        style={style}
        placeholder="Server Address"
        onChangeText={setAddress}
        value={address}
      />
      <Dialog.Button label="Connect" onPress={handleSave} />
    </Dialog.Container>
  );
}
