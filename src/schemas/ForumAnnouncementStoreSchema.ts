import { z } from "zod";

const ForumAnnouncementTranslationSchema = z.array(
    z.object({
        locale: z.string().nonempty(),
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        tags: z.array(z.string().nonempty()),
    })
);

const ForumAnnouncementStoreSchema = z.object({
    active: z.boolean(),
    translations: ForumAnnouncementTranslationSchema,
});

export { ForumAnnouncementStoreSchema, ForumAnnouncementTranslationSchema };
