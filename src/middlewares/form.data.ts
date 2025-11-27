import { AppContext } from "@/contex/app-context";
import { AppFile } from "@/types/upload.types";
export const formDataMiddleware = () => ({
  beforeHandle: async (c: AppContext) => {
    console.log("🔹 [formDataMiddleware] started...");

    const contentType = c.request.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json")) {
        const rawBody = await c.request.text();
        const jsonBody = JSON.parse(rawBody);

        (c as any).body = jsonBody;
        c.files = {};

        return;
      }

      if (contentType.includes("multipart/form-data")) {
        console.log("🔹 FormData request detected, parsing files...");

        const formData = await c.request.formData();
        const body: Record<string, any> = {};
        const files: Record<string, AppFile[]> = {};

        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            const buffer = Buffer.from(await value.arrayBuffer());
            const fileData: AppFile = {
              fieldname: key,
              originalname: value.name,
              encoding: "7bit",
              mimetype: value.type,
              buffer: buffer,
              size: value.size,
            };

            if (!files[key]) files[key] = [];
            files[key].push(fileData);
          } else {
            body[key] = value;
          }
        }

        (c as any).body = body;
        c.files = files;

        return;
      }

      (c as any).body = {};
      c.files = {};
    } catch (error) {
      console.error("❌ Error in formDataMiddleware:", error);

      (c as any).body = (c as any).body || {};
      c.files = c.files || {};
    }
  },
});
