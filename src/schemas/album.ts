import { z } from "zod";

export const AlbumUpdateSchema = z.object({
  name: z.string().min(1, "Tên album là bắt buộc"),
  description: z.string().optional().default(""),
  coverImage: z.instanceof(File).optional(),
  removeCoverImage: z.boolean().optional().default(false),
});

export type AlbumUpdateForm = z.infer<typeof AlbumUpdateSchema>;


