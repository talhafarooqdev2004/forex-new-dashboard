import { z } from "zod";

import { EDUCATION_LOCALES } from "@/types";

const EducationTranslationSchema = z.object({
    locale: z.enum(EDUCATION_LOCALES),
    title: z.string().trim().min(1, "Title is required"),
    content: z.string().trim().min(1, "Content is required"),
});

const EducationStoreSchema = z.object({
    slug: z.string().trim().min(1, "Slug is required"),
    publish: z.boolean(),
    translations: z.array(EducationTranslationSchema).length(5, "Five translations are required"),
});

export { EducationStoreSchema, EducationTranslationSchema };
