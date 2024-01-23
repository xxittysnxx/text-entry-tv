import Dialog from "react-native-dialog";

export default function SessionStartInput({ style, onClick }) {
  const handlePress = () => {
    onClick();
  };

  return (
    <Dialog.Container contentStyle={style} visible={true}>
      <Dialog.Title style={style}>Click to begin session</Dialog.Title>
      <Dialog.Button
        style={style}
        onPress={handlePress}
        label="Start Timer"
      />
    </Dialog.Container>
  );
}
