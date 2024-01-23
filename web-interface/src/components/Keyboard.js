import {
  Backspace,
  Forward,
  KeyboardCapslock,
  KeyboardTab,
  PlayArrow,
  Search,
} from "@mui/icons-material";
import React from "react";

import "./Keyboard.css";

import SimplifiedLayout from "../data/SimplifiedLayout";
import StandardLayout from "../data/StandardLayout";
import KeyboardButton from "./KeyboardButton";
import SuggestionButton from "./SuggestionButton";

class Keyboard extends React.Component {
  static simplifiedLayout = true;
  static defaultCursorStates = {
    // x and y and [0, 100] distance from topleft corner of keyboard
    leftCursor: {
      x: 31.5,
      y: 55.0,
      click: false,
      visible: false,
    },

    // x and y and [0, 100] distance from topleft corner of keyboard
    rightCursor: {
      x: 68.5,
      y: 55.0,
      click: false,
      visible: false,
    },
  }

  constructor(props) {
    super(props);

    // bind events to this instance
    this.onCapsLock = this.onCapsLock.bind(this);
    this.onShiftClick = this.onShiftClick.bind(this);
    this.onBackspace = this.onBackspace.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.onNavigate = this.onNavigate.bind(this);
    this.onKeyClick = this.onKeyClick.bind(this);
    this.onSuggestionClick = this.onSuggestionClick.bind(this);

    // set initial state
    this.state = {
      uppercase: false,
      capsLock: false,
      leftCursor: Keyboard.defaultCursorStates.leftCursor,
      rightCursor: Keyboard.defaultCursorStates.rightCursor,
    };

    // setup suggestions ref list
    this.suggestionRefs = [];
    this.previousTextSuggestions = [];

    // setup webhook listeners
    const { socket } = this.props;
    let self = this;
    socket.on("cursor-move", function (left, deltaX, deltaY) {
      if (left) {
        const { x, y } = self.state.leftCursor;
        const newX = Math.min(100, Math.max(0, x + deltaX));
        const newY = Math.min(100, Math.max(0, y + deltaY));

        self.setState({
          leftCursor: {
            x: newX,
            y: newY,
            click: false,
            visible: true,
          },
        });
      } else {
        const { x, y } = self.state.rightCursor;
        const newX = Math.min(100, Math.max(0, x + deltaX));
        const newY = Math.min(100, Math.max(0, y + deltaY));

        self.setState({
          rightCursor: {
            x: newX,
            y: newY,
            click: false,
            visible: true,
          },
        });
      }
    });

    socket.on("cursor-set", function (left, posX, posY) {
      const newX = Math.min(100, Math.max(0, posX));
      const newY = Math.min(100, Math.max(0, posY));

      if (left) {
        self.setState({
          leftCursor: {
            x: newX,
            y: newY,
            click: false,
            visible: true,
          },
        });
      } else {
        self.setState({
          rightCursor: {
            x: newX,
            y: newY,
            click: false,
            visible: true,
          },
        });
      }
    });

    socket.on("cursor-reset", function () {
      self.setState({
        leftCursor: Keyboard.defaultCursorStates.leftCursor,
        rightCursor: Keyboard.defaultCursorStates.rightCursor,
      });
    });

    socket.on("click", (left) => {
      const { absolute } = this.props;

      if (left) {
        const { x, y } = this.state.leftCursor;

        this.setState({
          leftCursor: {
            x: x,
            y: y,
            click: true,
            visible: !absolute,
          },
        });
      } else {
        const { x, y } = this.state.rightCursor;

        this.setState({
          rightCursor: {
            x: x,
            y: y,
            click: true,
            visible: !absolute,
          },
        });
      }
    });
  }

  getLayout() {
    if (Keyboard.simplifiedLayout) return SimplifiedLayout;
    else return StandardLayout;
  }

  onCapsLock() {
    const { capsLock } = this.state;

    this.setState({
      capsLock: !capsLock,
    });
  }

  onShiftClick() {
    const { uppercase } = this.state;

    this.setState({
      uppercase: !uppercase,
    });
  }

  onBackspace() {
    const { removeCharacter } = this.props;
    removeCharacter();
  }

  onEnter() {
    const { enterPressed } = this.props;
    enterPressed();
  }

  onNavigate(left) {
    const { moveCursor } = this.props;
    moveCursor(left);
  }

  onKeyClick(key) {
    const { placeCharacter } = this.props;
    const { uppercase } = this.state;

    placeCharacter(key);

    if (uppercase)
      this.setState({
        uppercase: false,
      });
  }

  onSuggestionClick(value) {
    const { setInputValue } = this.props;
    setInputValue(value);
  }

  calculateColumn(keys, posX) {
    // calculate default key width
    const keyWidth = 100 / (Keyboard.simplifiedLayout ? 11 : 14);

    // calculate number of stretch keys and space bars
    const stretchKeys = keys.filter(
      (value) => !["*sp", "*l", "*r"].includes(value) && value.includes("*")
    );
    const spaceKeys = keys.filter((value) => value === "*sp");
    const normalKeys = keys.filter(
      (value) => !stretchKeys.includes(value) && !spaceKeys.includes(value)
    );

    // calculate the increments for stretch keys
    const stretchWidthSum = 100 - normalKeys.length * keyWidth;
    const stretchWidthIncrement =
      stretchWidthSum / (spaceKeys.length * 3 + stretchKeys.length);

    // calculate key widths
    var widthSum = 0;
    const keyWidths = keys.map((value) => {
      var width = 0;

      if (normalKeys.includes(value)) {
        width = keyWidth;
      } else if (stretchKeys.includes(value)) {
        width = stretchWidthIncrement;
      } else if (spaceKeys.includes(value)) {
        width = stretchWidthIncrement * 3;
      }

      widthSum += width;
      return width;
    });

    // calculate key start positions
    var nextStartPos = (100 - widthSum) / 2;
    const keyStarts = keyWidths.map((value) => {
      const startPos = nextStartPos;
      nextStartPos += value;

      return startPos;
    });
    keyStarts[0] = 0;

    // determine column number from start positions
    const column = keyStarts.filter((value) => value < posX).length - 1;
    return column;
  }

  calculateSuggestionColumn(suggestions, posX) {
    var currentX = 0;

    for (let i = 0; i < this.suggestionRefs.length; i++) {
      const ref = this.suggestionRefs[i];
      const width = (ref.current.getBoundingClientRect().width + 4)
      const scalarWidth = (width / 1030) * 100;
      currentX += scalarWidth;

      if (currentX > 100) {
        return i - 1;
      } else if (currentX >= posX) {
        return i;
      }
    }
  }

  render() {
    const { uppercase, capsLock, rightCursor, leftCursor } = this.state;
    const { singleInputMode, textSuggestionsEnabled, textSuggestions } = this.props;
    const keys = this.getLayout();

    // reset text suggestion refs if suggestions changed
    if (textSuggestions !== this.previousTextSuggestions) {
      this.suggestionRefs = [];
      this.previousTextSuggestions = textSuggestions;
    }

    // calculate search suggestions height
    const suggestionsHeight = (36 / 326) * 100;
    const keyboardHeight = textSuggestionsEnabled ? (100 - suggestionsHeight) : 100

    // calculate row information to determine currently selected rows
    const rowHeight = keyboardHeight / keys.length;
    const maxRowIndex = keyboardHeight / rowHeight - 1;

    // calculate left cursor key position
    const leftY = textSuggestionsEnabled ? (leftCursor.y - suggestionsHeight) : leftCursor.y;
    var leftRow, leftColumn;
    if (textSuggestionsEnabled && leftY < 0) {
      leftRow = 'suggestions';
      leftColumn = this.calculateSuggestionColumn(textSuggestions, leftCursor.x);
    } else {
      leftRow = Math.min(Math.floor(leftY / rowHeight), maxRowIndex);
      leftColumn = this.calculateColumn(keys[leftRow], leftCursor.x);
    }

    // calculate right cursor key position
    const rightY = textSuggestionsEnabled ? (rightCursor.y - suggestionsHeight) : rightCursor.y;
    var rightRow, rightColumn;
    if (textSuggestionsEnabled && rightY < 0) {
      rightRow = 'suggestions';
      rightColumn = this.calculateSuggestionColumn(textSuggestions, rightCursor.x);
    } else {
      rightRow = Math.min(Math.floor(rightY / rowHeight), maxRowIndex);
      rightColumn = this.calculateColumn(keys[rightRow], rightCursor.x);
    }

    // create return value
    const value = (
      <div
        className={`keyboard ${Keyboard.simplifiedLayout
          ? "simplified-keyboard"
          : "standard-keyboard"
          }`}
        style={{
          height: textSuggestionsEnabled ? "326px" : "290px",
        }}
      >
        <div
          className={`cursor left-cursor ${!leftCursor.visible ? 'hidden' : 'visible'}`}
          style={{
            top: `calc(${leftCursor.y}% - 5px)`,
            left: `calc(${leftCursor.x}% - 5px)`,
          }}
        />

        {!singleInputMode && (
          <div
            className={`cursor right-cursor ${!rightCursor.visible ? 'hidden' : 'visible'}`}
            style={{
              top: `calc(${rightCursor.y}% - 5px)`,
              left: `calc(${rightCursor.x}% - 5px)`,
            }}
          />
        )}

        {textSuggestionsEnabled &&
          <div className="search-suggestions">
            {textSuggestions.length === 0
              ? <div style={{ height: "36px" }} />
              : textSuggestions.map((suggestion, i) => {
                // determine if key is hovered
                var selectedClass = "";
                if (leftCursor.visible && leftRow === 'suggestions' && i === leftColumn)
                  selectedClass = "left-hover";
                if (
                  rightCursor.visible &&
                  rightRow === 'suggestions' &&
                  i === rightColumn &&
                  !singleInputMode
                )
                  selectedClass = "right-hover";

                // determine if key is being clicked
                var clicking = false;
                if (leftRow === 'suggestions' && i === leftColumn && leftCursor.click)
                  clicking = true;
                if (rightRow === 'suggestions' && i === rightColumn && rightCursor.click)
                  clicking = true;

                // trigger click action, if necessary
                if (clicking) this.onSuggestionClick(suggestion);

                return (
                  <SuggestionButton
                    value={suggestion}
                    onClick={this.onSuggestionClick}
                    classes={selectedClass}
                    setRef={(ref) => this.suggestionRefs[i] = ref}
                  />
                );
              })}
          </div>
        }

        {keys.map((row, i) => {
          var shiftRow = false;
          if (row.includes("*sh")) shiftRow = true;

          return (
            <div className={`keyboard-row ${shiftRow ? "shift-row" : ""}`}>
              {row.map((button, j) => {
                // determine if key is hovered
                var selectedClass = "";
                if (leftCursor.visible && i === leftRow && j === leftColumn)
                  selectedClass = "left-hover";
                if (
                  rightCursor.visible &&
                  i === rightRow &&
                  j === rightColumn &&
                  !singleInputMode
                )
                  selectedClass = "right-hover";

                // determine if key is being clicked
                var clicking = false;
                if (i === leftRow && j === leftColumn && leftCursor.click)
                  clicking = true;
                if (i === rightRow && j === rightColumn && rightCursor.click)
                  clicking = true;

                // button values
                var buttonValue = "";
                var classes = "";
                var handleClick = this.onKeyClick;

                switch (button.toLowerCase()) {
                  case "*bs":
                    // @ts-ignore
                    buttonValue = <Backspace />;
                    classes = "stretch-key control-key";
                    handleClick = this.onBackspace;
                    break;
                  case "*sh":
                    // @ts-ignore
                    buttonValue = <Forward className="shift-icon" />;
                    classes = "stretch-key control-key";
                    handleClick = this.onShiftClick;
                    break;
                  case "*sp":
                    buttonValue = " ";
                    classes = "space-bar";
                    break;
                  case "*tb":
                    // @ts-ignore
                    buttonValue = <KeyboardTab />;
                    classes = "stretch-key control-key";
                    handleClick = () => this.onKeyClick("\t");
                    break;
                  case "*cps":
                    // @ts-ignore
                    buttonValue = <KeyboardCapslock />;
                    classes = "stretch-key control-key";
                    handleClick = this.onCapsLock;
                    break;
                  case "*e":
                    // @ts-ignore
                    buttonValue = <Search />;
                    classes = "stretch-key control-key";
                    handleClick = this.onEnter;
                    break;
                  case "\\":
                    buttonValue = "\\";
                    classes = "stretch-key";
                    break;
                  case "*l":
                    // @ts-ignore
                    buttonValue = <PlayArrow className="left-arrow-icon" />;
                    classes = "control-key";
                    handleClick = () => this.onNavigate(true);
                    break;
                  case "*r":
                    // @ts-ignore
                    buttonValue = <PlayArrow className="right-arrow-icon" />;
                    classes = "control-key";
                    handleClick = () => this.onNavigate(false);
                    break;
                  default:
                    buttonValue =
                      uppercase || capsLock
                        ? button.toUpperCase()
                        : button.toLowerCase();
                }

                if (clicking) handleClick(buttonValue);

                return (
                  <KeyboardButton
                    value={buttonValue}
                    onClick={handleClick}
                    classes={`${classes} ${selectedClass}`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );

    // override state if clicking == true
    if (rightCursor.click || leftCursor.click) {
      const leftX = leftCursor.x,
        leftY = leftCursor.y,
        leftVisible = leftCursor.visible;
      const rightX = rightCursor.x,
        rightY = rightCursor.y,
        rightVisible = rightCursor.visible;

      this.setState({
        leftCursor: {
          x: leftX,
          y: leftY,
          click: false,
          visible: leftVisible,
        },

        rightCursor: {
          x: rightX,
          y: rightY,
          click: false,
          visible: rightVisible,
        },
      });
    }

    return value;
  }
}

export default Keyboard;