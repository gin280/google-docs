import React, { useState } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: '这是一个示例文本.' }],
  },
];

const MyEditor = () => {
  const editor = withReact(createEditor());
  const [value, setValue] = useState(initialValue);

  return (
    <Slate editor={editor} value={value} onChange={newValue => setValue(newValue)}>
      <Editable />
    </Slate>
  );
};

export default MyEditor;
