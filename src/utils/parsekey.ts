import { AppFile } from "@/types/upload.types";
export const parseFormData = async (req: Request) => {
  const formData = await req.formData();
  const result: {
    body: Record<string, any>;
    files: Record<string, AppFile[]>;
  } = {
    body: {},
    files: {},
  };

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

      if (!result.files[key]) result.files[key] = [];
      result.files[key].push(fileData);
    } else {
      result.body[key] = value;
    }
  }

  return result;
};
