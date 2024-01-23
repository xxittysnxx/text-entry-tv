import React from "react";
import { Search } from "@mui/icons-material";
import { useRef } from "react";

function SuggestionButton(props) {
  const { onClick, value, classes, setRef } = props;
  const ref = useRef();

  const button = (
    <button
      className={`search-suggestion ${classes || ''}`}
      type="button"
      ref={ref}
      onClick={() => onClick(value)}
    >
      <Search />
      {value}
    </button>
  );

  setRef(ref);

  return button;
}

export default SuggestionButton;