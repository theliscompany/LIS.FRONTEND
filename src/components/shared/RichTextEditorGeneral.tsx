// RichTextEditor.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const RichTextEditorGeneral = ({ content, onUpdate }: any) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        onUpdate: ({ editor }) => {
            onUpdate(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <EditorContent
            controls 
            editor={editor} 
        />
    );
};

export default RichTextEditorGeneral;
