import { z } from "zod";

export const SongUpdateSchema = z.object({
  title: z.string().min(1, "Tên bài hát là bắt buộc"),
  description: z.string().optional().default(""),
  background: z.instanceof(File).optional(),
  removeBackground: z.boolean().optional().default(false),
});

export type SongUpdateForm = z.infer<typeof SongUpdateSchema>;


