import { hc } from "hono/client";
import { Resource } from "sst";
import type { AppType } from "@form-builder/api";

export const api = hc<AppType>(Resource.Api.url).api;
