import React, { useState, useEffect } from "react";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import Title from "./Components/Title";
import CustomEditor from "./Components/Editor";
import Button from "./Components/Button";

const App = () => {
  const [editorName, setEditorName] = useState("");
  const [editorEnabled, setEditorEnabled] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedContent = localStorage.getItem("draftjs-content");
    if (savedContent) {
      try {
        const { name, content } = JSON.parse(savedContent);
        setEditorName(name);
        setEditorState(EditorState.createWithContent(convertFromRaw(content)));
        setEditorEnabled(name.trim() !== "");
      } catch (error) {
        console.error("Error parsing saved content:", error);
      }
    }
    setLoading(false);
  }, []);

  const handleNameChange = (event) => {
    const newName = event.target.value;
    setEditorName(newName);
    setEditorEnabled(newName.trim() !== "");
  };

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const contentJSON = JSON.stringify(convertToRaw(contentState));

    const dataToSave = {
      name: editorName,
      content: JSON.parse(contentJSON),
    };

    localStorage.setItem("draftjs-content", JSON.stringify(dataToSave));
    console.log("Content saved successfully");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <div className="title-and-input">
        <Title />
        <div className="name-input">
          <input
            type="text"
            value={editorName}
            onChange={handleNameChange}
            placeholder="Your Name"
            className={`name-input-field ${editorEnabled ? "h3-style" : ""}`}
          />
        </div>
      </div>

      <Button onSave={handleSave} />

      <CustomEditor
        editorName={editorName}
        editorEnabled={editorEnabled}
        editorState={editorState}
        onEditorChange={handleEditorChange}
        initialContent={convertToRaw(editorState.getCurrentContent())}
      />
    </div>
  );
};
export default App;
