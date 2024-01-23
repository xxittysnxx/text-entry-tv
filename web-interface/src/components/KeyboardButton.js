import React from "react";

class KeyboardButton extends React.Component {
  render() {
    const { onClick, value, classes } = this.props;

    return (
      <button
        className={`keyboard-button ${classes || ''}`}
        type="button"
        onClick={() => onClick(value)}
      >
        {value}
      </button>
    );
  }
}

export default KeyboardButton;