import { useRef } from "react";
import { Editor } from "@monaco-editor/react";

type JsonProp = {
  data: Record<string, unknown>
}


const JsonEditor = ({data}: JsonProp) => {
  const editorRef = useRef();
  // Removed unused state variables
  const language = "";

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <div style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', backgroundColor: 'white', overflow: 'hidden' }}>
      <style>
        {`
          .scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .scrollbar::-webkit-scrollbar-thumb {
            background-color: #888;
          }
        `}
      </style>
      <Editor
        options={{
          minimap: {
            enabled: true,
          },
          lineNumbers: 'off', // Remove line number enumeration
          readOnly: true,
          padding: {
            top: 10,
            bottom: 10, // Add bottom padding if needed
          },
          scrollbar: {
            verticalScrollbarSize: 5, // Adjust scrollbar width
          },
        }}
        height="75vh"
        language={language}
        defaultValue={data}
        onMount={onMount}
        value={JSON.stringify(data, null, 2)}
      />
    </div>
  );
};
export default JsonEditor;