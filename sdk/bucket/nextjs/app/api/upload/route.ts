import { createRouteHandler } from "ocel/bucket/next";
import { uploads } from "../../../infra";

export const { GET, POST } = createRouteHandler(uploads);
