"use client";

import { useMemo, useState } from "react";

import { EducationCreateDialog } from "@/components/features/dialogs";
import { EducationSidebar } from "@/components/layout";
import { Button } from "@/components/ui";
import Container from "@/components/ui/layout/Container";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEducations } from "@/hooks";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import { EducationArticleSkeleton } from "@/components/skeletons/EducationArticleSkeleton";

export default function EducationClientPage() {
    const { isAdmin } = useAuth();
    const {
        educations,
        isLoading,
        error,
        isDialogLoading,
        dialogMode,
        isDialogOpen,
        selectedEducation,
        editingEducationId,
        deletingEducationId,
        publishingEducationId,
        openCreateDialog,
        openEditDialog,
        closeDialog,
        submitEducation,
        deleteEducation,
        togglePublishEducation,
    } = useEducations();
    const [requestedEducationId, setRequestedEducationId] = useState<number | null>(null);

    const activeEducation = useMemo(
        () =>
            educations.find((education) => education.id === requestedEducationId) ??
            educations[0] ??
            null,
        [educations, requestedEducationId],
    );

    const activeEducationId = activeEducation?.id ?? null;

    return (
        <Container className="gap-6 bg-darkGrey">
            <div className="flex min-h-[calc(100vh-180px)]">
                <EducationSidebar
                    items={educations.map((education) => ({
                        id: education.id,
                        title: education.translation?.title ?? "Untitled topic",
                    }))}
                    activeEducationId={activeEducationId}
                    onSelectEducation={setRequestedEducationId}
                    isLoading={isLoading}
                />
                <section className="flex-1 border-l border-solid border-[#E5E7EB] p-8">
                    {isAdmin ? (
                        <div className="flex gap-2 justify-end mb-5">
                            <Button
                                variant="primary"
                                className="bg-royalBlue text-white hover:bg-royalBlue/90"
                                onClick={openCreateDialog}
                            >
                                Create
                            </Button>
                            {activeEducation ? (
                                <>
                                    <Button
                                        variant="primary"
                                        className="bg-royalBlue text-white hover:bg-royalBlue/90"
                                        onClick={() => void openEditDialog(activeEducation.id)}
                                        disabled={editingEducationId === activeEducation.id}
                                    >
                                        {editingEducationId === activeEducation.id ? "Loading..." : "Edit"}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="bg-royalBlue text-white hover:bg-royalBlue/90"
                                        onClick={() => void togglePublishEducation(activeEducation)}
                                        disabled={publishingEducationId === activeEducation.id}
                                    >
                                        {publishingEducationId === activeEducation.id
                                            ? "Saving..."
                                            : activeEducation.publish
                                                ? "Unpublish"
                                                : "Publish"}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="text-white hover:brightness-110"
                                        style={{ backgroundColor: GAUGE_SIGNAL_COLORS.sell }}
                                        onClick={() => void deleteEducation(activeEducation.id)}
                                        disabled={deletingEducationId === activeEducation.id}
                                    >
                                        {deletingEducationId === activeEducation.id ? "Deleting..." : "Delete"}
                                    </Button>
                                </>
                            ) : null}
                        </div>
                    ) : null}

                    {error ? (
                        <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    ) : null}

                    {isLoading ? <EducationArticleSkeleton /> : null}

                    {!isLoading && !activeEducation ? (
                        <div className="text-center text-secondary">
                            No education topic is selected yet.
                        </div>
                    ) : null}

                    {!isLoading && activeEducation ? (
                        <div
                            className="education-content text-foreground [&_p]:text-[12pt] [&_p]:leading-[25px] [&_p:empty]:min-h-[25px] [&_span]:text-[12pt] [&_li]:text-[12pt] [&_li]:leading-[25px] [&_li]:my-1 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-snug [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-snug [&_img]:max-w-full [&_img]:h-auto"
                            dangerouslySetInnerHTML={{ __html: activeEducation.translation?.content ?? "" }}
                        />
                    ) : null}
                </section>
            </div>

            <EducationCreateDialog
                open={isDialogOpen}
                mode={dialogMode}
                education={selectedEducation}
                isLoading={isDialogLoading}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    }
                }}
                onSubmitEducation={submitEducation}
            />
        </Container>
    );
}
