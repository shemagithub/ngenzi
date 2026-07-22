import { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillEditor = ({ value, onChange, ...props }) => {
  const quillRef = useRef(null);

  useEffect(() => {
    // Suppress console warnings for findDOMNode (known react-quill issue)
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('findDOMNode')) {
        return; // Suppress findDOMNode warnings
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return (
    <div className="bg-white">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
          ]
        }}
        {...props}
      />
    </div>
  );
};

export default QuillEditor;

