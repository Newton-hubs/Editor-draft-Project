import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  convertFromRaw,
  convertToRaw,
} from "draft-js";
import "./Editor.css";
import Immutable from "immutable";

const CustomEditor = ({ onEditorChange, editorEnabled, initialContent }) => {
  const [name, setName] = useState("");
  const [editorState, setEditorState] = useState(
    initialContent
      ? EditorState.createWithContent(convertFromRaw(initialContent))
      : EditorState.createEmpty()
  );

  useEffect(() => {
    const savedContent = localStorage.getItem("draftjs-content");

    try {
      if (savedContent && savedContent.trim() !== "") {
        const parsedContent = JSON.parse(savedContent);

        if (parsedContent.name && parsedContent.content) {
          setName(parsedContent.name);
          const contentState = convertFromRaw(parsedContent.content);
          setEditorState(EditorState.createWithContent(contentState));
        } else {
          console.error("Invalid saved content:", parsedContent);
        }
      }
    } catch (error) {
      console.error("Error parsing saved content:", error);
      console.error("Saved content:", savedContent);
    }
  }, []);

  const handleChange = (newEditorState) => {
    setEditorState(newEditorState);
    if (onEditorChange) {
      onEditorChange(newEditorState);
    }
  };

  const handleBeforeInput = (char) => {
    const contentState = editorState.getCurrentContent();
    console.log(convertToRaw(contentState));
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const blockText = contentState.getBlockForKey(blockKey).getText();
    const currentInlineStyle = editorState.getCurrentInlineStyle();

    if (
      char === " " &&
      blockText.startsWith("#") &&
      selection.getStartOffset() === 1
    ) {
      console.log("Enter The Hash");
      const isRed = currentInlineStyle.has("COLOR_RED");
      const newEditorState = RichUtils.toggleBlockType(
        editorState,
        "header-one"
      );

      const withoutHash = Modifier.replaceText(
        newEditorState.getCurrentContent(), 
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        ""
      );

      const withoutOtherStyles = Modifier.setBlockType(
        withoutHash,
        newEditorState.getSelection(),
        "header-one"
      );

      const finalEditorState = isRed
        ? EditorState.setInlineStyleOverride(
            EditorState.createWithContent(withoutOtherStyles),
            Immutable.OrderedSet()
          )
        : EditorState.createWithContent(withoutOtherStyles);

      setEditorState(
        EditorState.push(finalEditorState, withoutHash, "remove-char")
      );

      return "handled";
    }

    if (
      char === " " &&
      blockText.trim() === "*" &&
      selection.getStartOffset() === blockText.length
    ) {
      const isHeading =
        RichUtils.getCurrentBlockType(editorState) === "header-one";
      const isRed = currentInlineStyle.has("COLOR_RED");

      const withoutStar = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: selection.getStartOffset() - 1,
          focusOffset: selection.getStartOffset(),
        }),
        ""
      );

      const withBoldAndWithoutRed = RichUtils.toggleInlineStyle(
        EditorState.push(editorState, withoutStar, "remove-char"),
        "BOLD"
      );

      const finalEditorState = isRed
        ? EditorState.setInlineStyleOverride(
            withBoldAndWithoutRed,
            Immutable.OrderedSet()
          )
        : withBoldAndWithoutRed;

      const updatedEditorState = isHeading
        ? RichUtils.toggleBlockType(finalEditorState, "unstyled")
        : finalEditorState;

      setEditorState(updatedEditorState);
      return "handled";
    }

    if (
      char === " " &&
      blockText.trim() === "***" &&
      selection.getStartOffset() === blockText.length
    ) {
      const isRed = currentInlineStyle.has("COLOR_RED");

      const updatedContentState = Modifier.applyInlineStyle(
        contentState,
        selection.merge({
          anchorKey: blockKey,
          anchorOffset: selection.getStartOffset() - 3,
          focusKey: blockKey,
          focusOffset: selection.getStartOffset(),
        }),
        "BOLD"
      );

      const finalContentState = Modifier.applyInlineStyle(
        updatedContentState,
        selection.merge({
          anchorKey: blockKey,
          anchorOffset: selection.getStartOffset() - 3,
          focusKey: blockKey,
          focusOffset: selection.getStartOffset(),
        }),
        "UNDERLINE"
      );

      const contentWithoutRed = Modifier.removeInlineStyle(
        finalContentState,
        selection.merge({
          anchorKey: blockKey,
          anchorOffset: selection.getStartOffset() - 3,
          focusKey: blockKey,
          focusOffset: selection.getStartOffset(),
        }),
        "COLOR_RED"
      );

      const updatedEditorState = EditorState.push(
        editorState,
        contentWithoutRed,
        "change-inline-style"
      );

      const finalEditorState = isRed
        ? RichUtils.toggleInlineStyle(updatedEditorState, "unstyled")
        : updatedEditorState;

      setEditorState(finalEditorState);
      return "handled";
    }

    if (
      char === " " &&
      blockText.trim() === "**" &&
      selection.getStartOffset() === blockText.length
    ) {
      const withoutStars = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: selection.getStartOffset() - 2,
          focusOffset: selection.getStartOffset(),
        }),
        ""
      );

      const updatedContentState = Modifier.applyInlineStyle(
        contentState,
        selection.merge({
          anchorKey: blockKey,
          anchorOffset: selection.getStartOffset() - 3, 
          focusKey: blockKey,
          focusOffset: selection.getStartOffset(),
        }),
        "BOLD"
      );

      const withoutRedColor = Modifier.removeInlineStyle(
        contentState,
        selection.merge({
          anchorKey: blockKey,
          anchorOffset: 0,
          focusKey: blockKey,
          focusOffset: blockText.length,
        }),
        "COLOR_RED"
      );

      const withRedColor = EditorState.setInlineStyleOverride(
        EditorState.push(editorState, withoutStars, "change-inline-style"),
        Immutable.OrderedSet(["COLOR_RED"])
      );

      setEditorState(withRedColor);

      return "handled";
    }

    return "not-handled";
  };

  const styleFn = (style) => {
    if (style.includes("COLOR_RED")) {
      return { color: "red" };
    }
    return null;
  };

  return (
    <div className="custom-editor" style={{ direction: "ltr" }}>
      <Editor
        editorState={editorState}
        onChange={handleChange}
        handleBeforeInput={editorEnabled ? handleBeforeInput : undefined}
        readOnly={!editorEnabled}
        customStyleFn={styleFn}
      />
    </div>
  );
};

export default CustomEditor;
