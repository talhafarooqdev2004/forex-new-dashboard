"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import Container from "@/components/ui/layout/Container";
import Image from "next/image";

const topics = [
    {
        id: 1,
        title: "GBPJPY: Is BoE Rate Hike Priced In?",
        tags: ["GBPJPY", "Fundamental"],
        author: "TraderMike",
        createdAt: "1 hour ago",
        replies: 15,
        views: 482,
    },
    {
        id: 2,
        title: "Gold at Key Resistance Level",
        tags: ["XAUUSD", "Technical Analysis"],
        author: "FXMaster",
        createdAt: "1 hour ago",
        replies: 15,
        views: 482,
    },
    {
        id: 3,
        title: "Will USD Strength Continue?",
        tags: ["EURUSD", "USD"],
        author: "FXMaster",
        createdAt: "1 hour ago",
        replies: 15,
        views: 482,
    },
    {
        id: 4,
        title: "NFP Expectations for Friday",
        tags: ["NFP", "Economic Data"],
        author: "FXMaster",
        createdAt: "1 hour ago",
        replies: 15,
        views: 482,
    },
    {
        id: 5,
        title: "How do you manage your risk?",
        tags: ["Trading Psychology"],
        author: "FXMaster",
        createdAt: "1 hour ago",
        replies: 15,
        views: 482,
    },
    {
        id: 6,
        title: "GBPUSD Scalping Strategy",
        tags: ["GBPUSD"],
        author: "FXMaster",
        createdAt: "1 hour ago",
        replies: 15,
        views: 482,
    },
];

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
                    <h1>Announcement</h1>
                </TabsContent>
                <TabsContent value="rules">
                    <h1>Rules</h1>
                </TabsContent>
                <TabsContent value="general-discussion">
                    <TopicLists>
                        {topics.map((topic) => (
                            <TopicSection key={topic.id}>
                                <TopicTitle>
                                    {topic.title}
                                </TopicTitle>

                                <TopicMetaList>
                                    <div className="flex items-center gap-3">
                                        <TagsList>
                                            {topic.tags?.map((tag) => (
                                                <Tag key={tag}>{tag}</Tag>
                                            ))}
                                        </TagsList>

                                        <Author>{topic.author ?? "Unknown"}</Author>
                                        <CreatedAt>{topic.createdAt}</CreatedAt>
                                    </div>

                                    <div className="flex justify-center items-center gap-14">
                                        <div className="flex items-center gap-3">
                                            <Replies>{topic.replies}</Replies>
                                            <Views>{topic.views}</Views>
                                        </div>

                                        <AuthorImg src="/images/temporary/forum-profile.jpg" />
                                    </div>
                                </TopicMetaList>
                            </TopicSection>
                        ))}
                    </TopicLists>
                </TabsContent>
                <TabsContent value="technical-charts">
                    <h1>Technical Charts</h1>
                </TabsContent>
                <TabsContent value="fundamental-discussion">
                    <h1>Fundamental Discussion</h1>
                </TabsContent>
                <TabsContent value="success-stories">
                    <h1>Success Stories</h1>
                </TabsContent>
            </Tabs>
        </Container>
    );
};

function TopicLists({ children }: React.PropsWithChildren) {
    return (
        <div>
            {children}
        </div>
    );
};

function TopicSection({ children }: React.PropsWithChildren) {
    return (
        <div className="border-b border-solid border-stroke py-6 flex flex-col gap-3">
            {children}
        </div>
    );
};

function TopicTitle({ children }: React.PropsWithChildren) {
    return (
        <h6>{children}</h6>
    );
};

function TopicMetaList({ children }: React.PropsWithChildren) {
    return (
        <div className="flex justify-between items-center gap-3">
            {children}
        </div>
    );
};

function TagsList({ children }: React.PropsWithChildren) {
    return (
        <div className="flex items-center gap-3">
            {children}
        </div>
    );
};

function Tag({ children }: React.PropsWithChildren) {
    return (
        <div className="bg-royalBlue rounded-[12px] px-3 py-2 h-8 text-white flex items-center justify-center">
            {children}
        </div>
    );
};

function Author({ children }: React.PropsWithChildren) {
    return (
        <span>{children}</span>
    );
};

function CreatedAt({ children }: React.PropsWithChildren) {
    return (
        <span>{children}</span>
    );
};

function Replies({ children }: React.PropsWithChildren) {
    return (
        <span className="block border-r border-solid border-stroke pr-4">
            <span className="font-semibold mr-1">{children}</span>
            <span>Replies</span>
        </span>
    );
};

function Views({ children }: React.PropsWithChildren) {
    return (
        <span>
            <span className="font-semibold mr-1">{children}</span>
            <span>Views</span>
        </span>
    );
};

function AuthorImg({ src }: { src: string }) {
    return (
        <div className="w-10 h-10 relative overflow-hidden rounded-full">
            <Image
                src={src}
                alt="author"
                fill
                className="object-cover"
            />
        </div>
    );
};