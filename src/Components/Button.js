// Button.js
import React from "react";
import './Button.css'; 
import { convertToRaw } from "draft-js";

const Button = ({ editorState, onSave }) => {
  const handleSaveClick = () => {
    if (onSave) {
      onSave();
    }
  };

  return <button className="save-button" onClick={handleSaveClick}>Save</button>;
};

export default Button;
