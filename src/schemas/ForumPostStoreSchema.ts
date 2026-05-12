import { z } from "zod";
import { FORUM_POST_CATEGORIES } from "@/types";

const ForumPostStoreSchema = z.object({
    active: z.boolean(),
    category: z.enum(FORUM_POST_CATEGORIES),
    title: z.string().min(3).max(120),
    content: z.string(),
    imagePath: z.string().min(1, "Post image is required"),
    tags: z.array(z.string()),
});

export { ForumPostStoreSchema };
