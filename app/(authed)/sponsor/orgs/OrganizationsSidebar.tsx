"use client";

import { OrganizationsSidebar as SharedOrganizationsSidebar } from "@/components/org/OrganizationsSidebar";
import { CreateOrganizationModel } from "@/app/(authed)/admin/orgs/CreateOrganizationModel";

export function OrganizationsSidebar() {
    return (
        <SharedOrganizationsSidebar
            basePath="/sponsor/orgs"
            createAction={<CreateOrganizationModel />}
        />
    );
}