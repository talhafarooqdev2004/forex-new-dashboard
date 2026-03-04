import { EducationSidebar } from "@/components/layout";
import Container from "@/components/ui/layout/Container";

export default function EducationClientPage() {
    return (
        <Container className="gap-6 bg-darkGrey">
            <div className="flex">
                <EducationSidebar />
                <div className="border-l border-solid border-[#E5E7EB] flex-1">

                </div>
            </div>
        </Container>
    );
};