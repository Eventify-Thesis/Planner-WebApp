import { EventModel } from '@/domain/EventModel';
import { uploadFile } from './fileUpload.service';
import { notificationController } from '@/controllers/notificationController';
import { saveEventDraftAPI } from '@/api/events.api';

export const eventInfoDraft = async (
  data: any,
): Promise<EventModel | undefined> => {
  try {
    const [categoryIds, categories] = data.category.split('_');

    const event = await saveEventDraftAPI({
      ...data,
      categories: [categories],
      categoriesIds: [categoryIds],
    });

    notificationController.success({
      message: 'Saved event information successfully!',
    });

    return event;
  } catch (e: any) {
    notificationController.error({
      message: e.message || 'Failed to save event draft',
    });
    throw e;
  }
};
