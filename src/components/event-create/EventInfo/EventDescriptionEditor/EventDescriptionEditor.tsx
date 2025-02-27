import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import BlotFormatter from 'quill-blot-formatter';
import './styles.css';
import { useTranslation } from 'react-i18next';
import type { RcFile, UploadProps } from 'antd/es/upload';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getSignUrl } from '@/api/media.api';
import dynamic from 'next/dynamic';
import { useNavigate } from 'react-router-dom';
import { notificationController } from '@/controllers/notificationController';

Quill.register('modules/blotFormatter', BlotFormatter);
const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');

    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  {
    ssr: false,
  },
);

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

interface EditorProps {
  editorHtml: string;
  onChange: (html: string) => void;
}

const Editor: React.FC<EditorProps> = ({ editorHtml, onChange }) => {
  const [isLoading, setLoading] = useState(false);
  const [isFieldsChanged, setFieldsChanged] = useState(false);
  const quillRef = useRef();
  const { t } = useTranslation();

  const navigate = useNavigate();

  const uploadFile = async (file: RcFile | File) => {
    let res = '';
    await getSignUrl({
      fileName: file.name,
      contentType: file.type,
      isPublic: true,
      folder: 'planner/events',
    })
      .then(async (data) => {
        const urlObj = new URL(data.url);
        const url = `${urlObj.origin}${urlObj.pathname}`;
        await axios
          .put(data.url, file, {
            headers: {
              'Content-Type': file.type,
            },
          })
          .then(() => {
            res = url.toString();
          });
      })
      .catch((error) => {
        notificationController.error(error);
      });
    return res;
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');

    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();

      formData.append('image', file);

      // Save current cursor state
      const range = quillRef.current.editor.getSelection(true);

      // Insert temporary loading placeholder image
      quillRef.current.editor.insertEmbed(
        range.index,
        'image',
        `${window.location.origin}/images/loaders/placeholder.gif`,
      );

      // Move cursor to right side of image (easier to continue typing)
      quillRef.current.editor.setSelection(range.index + 1);

      const imageURL = await uploadFile(file);

      // Remove placeholder image
      quillRef.current.editor.deleteText(range.index, 1);

      // Insert uploaded image
      // this.quill.insertEmbed(range.index, 'image', res.body.image);
      quillRef.current.editor.insertEmbed(range.index, 'image', imageURL);
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [] }, { font: [] }],
          [{ size: [] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          ['link', 'image', 'video'],
          ['clean'],
          [{ align: [] }],
          [{ color: [] }, { background: [] }],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      blotFormatter: {},
    }),
    [],
  );

  const handleOnChange = (html: string) => {
    onChange(html);
    setFieldsChanged(true);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  useEffect(() => {
    const init = (quill) => undefined;
    const check = () => {
      if (quillRef.current) {
        init(quillRef.current);
        return;
      }
      setTimeout(check, 200);
    };
    check();
  }, [quillRef]);

  return (
    <ReactQuill
      forwardedRef={quillRef}
      value={editorHtml}
      modules={modules}
      formats={formats}
      // bounds={'#root'}
      onChange={handleOnChange}
    />
  );
};

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'align',
  'color',
];

export default Editor;
