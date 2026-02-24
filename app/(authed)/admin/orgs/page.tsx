import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { BuildingIcon } from "lucide-react";

export default function Page() {
  return (
    <div className="flex h-full items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BuildingIcon />
          </EmptyMedia>
          <EmptyTitle>No Organization Selected</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t selected an organization yet. Get started by selecting an organization.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
