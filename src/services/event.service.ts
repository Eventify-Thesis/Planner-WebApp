import { EventModel } from '@/domain/EventModel';
import { uploadFile } from './fileUpload.service';
import { notificationController } from '@/controllers/notificationController';
import {
  EventBriefResponse,
  getEventBriefAPI,
  getEventPaymentAPI,
  getEventSettingAPI,
  getEventShowAPI,
  saveEventDraftAPI,
  updateEventPaymentAPI,
  updateEventSettingAPI,
  updateEventShowAPI,
} from '@/api/events.api';
import { ShowModel } from '@/domain/ShowModel';
import { SettingModel } from '@/domain/SettingModel';
import { PaymentModel } from '@/domain/PaymentModel';

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

    return event;
  } catch (e: any) {
    notificationController.error({
      message: e.message || 'Failed to save event draft',
    });
    throw e;
  }
};

export const updateEventShow = async (
  eventId: string,
  show: ShowModel,
): Promise<ShowModel | undefined> => {
  try {
    const response = await updateEventShowAPI(eventId, show);
    return response;
  } catch (e: any) {
    notificationController.error({
      message: e.message || 'Failed to save show',
    });
    throw e;
  }
};

export const getEventShow = async (
  eventId: string,
): Promise<ShowModel | undefined> => {
  try {
    const response = await getEventShowAPI(eventId);
    return response;
  } catch (e: any) {
    throw e;
  }
};

export const updateEventSetting = async (
  eventId: string,
  setting: SettingModel,
): Promise<SettingModel | undefined> => {
  try {
    const response = await updateEventSettingAPI(eventId, setting);
    return response;
  } catch (e: any) {
    throw e;
  }
};

export const getEventSetting = async (
  eventId: string,
): Promise<SettingModel | undefined> => {
  try {
    const response = await getEventSettingAPI(eventId);
    return response;
  } catch (e: any) {
    throw e;
  }
};

export const updateEventPayment = async (
  eventId: string,
  payment: PaymentModel,
): Promise<PaymentModel | undefined> => {
  try {
    const response = await updateEventPaymentAPI(eventId, payment);
    return response;
  } catch (e: any) {
    throw e;
  }
};

export const getEventPayment = async (
  eventId: string,
): Promise<PaymentModel | undefined> => {
  try {
    const response = await getEventPaymentAPI(eventId);
    return response;
  } catch (e: any) {
    throw e;
  }
};

export const getEventBrief = async (
  eventId: string,
): Promise<EventBriefResponse | undefined> => {
  try {
    const response = await getEventBriefAPI(eventId);
    return response;
  } catch (e: any) {
    throw e;
  }
};
