import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function OrganizationError({ error }: { error: Error }) {
        return (
                <Alert variant="destructive" className="max-w-md">
                        <AlertCircleIcon />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{"error" in error ? (error.error as any).message : error.message}</AlertDescription>
                </Alert>
        )
}
