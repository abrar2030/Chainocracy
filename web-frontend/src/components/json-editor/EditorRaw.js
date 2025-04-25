import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
const JsonEditor = ({ data }) => {
    const editorRef = useRef();
    const [value, setValue] = useState("");
    const language = "";
    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };
    return (_jsxs("div", { style: { borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', backgroundColor: 'white', overflow: 'hidden' }, children: [_jsx("style", { children: `
          .scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .scrollbar::-webkit-scrollbar-thumb {
            background-color: #888;
          }
        ` }), _jsx(Editor, { options: {
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
                }, height: "75vh", language: language, defaultValue: data, onMount: onMount, value: JSON.stringify(data, null, 2) })] }));
};
export default JsonEditor;
