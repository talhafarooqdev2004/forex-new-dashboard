"use client";

import {
    ForumAnnouncementsSection,
    ForumPostsSection,
    ForumRulesSection
} from "@/components/composed/forum";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui";
import Container from "@/components/ui/layout/Container";

export default function ForumClientPage() {
    return (
        <Container>
            <Tabs defaultValue="general-discussion">
                <TabsList>
                    <TabsTrigger variant="forum" value="announcement">Announcement</TabsTrigger>
                    <TabsTrigger variant="forum" value="rules">Rules</TabsTrigger>
                    <TabsTrigger variant="forum" value="general-discussion">General Discussion</TabsTrigger>
                    <TabsTrigger variant="forum" value="technical-charts">Technical Charts</TabsTrigger>
                    <TabsTrigger variant="forum" value="fundamental-discussion">Fundamental Discussion</TabsTrigger>
                    <TabsTrigger variant="forum" value="success-stories">Success Stories</TabsTrigger>
                </TabsList>

                <TabsContent value="announcement">
                    <ForumAnnouncementsSection />
                </TabsContent>

                <TabsContent value="rules">
                    <ForumRulesSection />
                </TabsContent>

                <TabsContent value="general-discussion">
                    <ForumPostsSection category="general-discussion" />
                </TabsContent>

                <TabsContent value="technical-charts">
                    <ForumPostsSection category="technical-charts" />
                </TabsContent>

                <TabsContent value="fundamental-discussion">
                    <ForumPostsSection category="fundamental-discussion" />
                </TabsContent>

                <TabsContent value="success-stories">
                    <ForumPostsSection category="success-stories" />
                </TabsContent>
            </Tabs>
        </Container>
    );
}
