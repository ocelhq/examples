import { createRealtimeHandler } from "ocel/realtime/next";
import { rt } from "../../../infra";

// Browsers authorize their subscriptions through this route; the transport only checks its tokens.
export const { GET, POST, OPTIONS } = createRealtimeHandler(rt);
