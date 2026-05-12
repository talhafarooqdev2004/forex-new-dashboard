export const EDUCATION_LOCALES = ["en", "ru", "de", "fr", "zh"] as const;

export type EducationLocale = typeof EDUCATION_LOCALES[number];

export type EducationTranslation = {
    id: number;
    locale: EducationLocale;
    title: string;
    content: string;
};

export type Education = {
    id: number;
    slug: string;
    publish: boolean;
    translation: EducationTranslation | null;
    translations: EducationTranslation[];
    createdAt?: string;
    updatedAt?: string;
};
