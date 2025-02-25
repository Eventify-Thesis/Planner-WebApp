// @ts-nocheck
// @ts-ignore
import AxiosMockAdapter from "axios-mock-adapter";
import { httpApi } from "@/api/http.api";

export const httpApiMock = new AxiosMockAdapter(httpApi, {
  delayResponse: 1000,
});
