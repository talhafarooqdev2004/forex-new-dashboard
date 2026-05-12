import { z } from "zod";

const ForumRuleTranslationSchema = z.array(
    z.object({
        locale: z.string().nonempty(),
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        tags: z.array(z.string().nonempty()),
    })
);

const ForumRuleStoreSchema = z.object({
    active: z.boolean(),
    translations: ForumRuleTranslationSchema,
});

export { ForumRuleStoreSchema, ForumRuleTranslationSchema };