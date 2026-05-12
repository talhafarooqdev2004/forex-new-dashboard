export type ForumAnnouncementLocale = "en" | "ru" | "de" | "fr" | "zh";

export type ForumAnnouncementTranslation = {
    id: number;
    locale: ForumAnnouncementLocale;
    title: string;
    description: string;
    tags: string[];
};

export type ForumAnnouncement = {
    id: number;
    active: boolean;
    translation: ForumAnnouncementTranslation | null;
    translations: ForumAnnouncementTranslation[];
    createdAt: string;
    updatedAt: string;
};

export type ForumAnnouncementsProps = {
    announcements?: ForumAnnouncement[];
};
