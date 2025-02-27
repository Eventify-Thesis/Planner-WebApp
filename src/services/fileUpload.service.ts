import axios from 'axios';
import { RcFile } from 'antd/es/upload';
import { notificationController } from '@/controllers/notificationController';
import { getSignUrl } from '@/api/media.api';

export const uploadFile = async (file: RcFile | File): Promise<string> => {
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
