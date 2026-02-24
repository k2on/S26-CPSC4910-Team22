"use client";

import type { UserData } from "@/hooks/use-userData";

type Props = {
    users: UserData[];
};

export function UsersTable({ users }: Props) {
    const formatCreatedAt = (value: string | Date | null | undefined) => {
        if (!value) return "—";
        const date = value instanceof Date ? value : new Date(value);
        return date.toLocaleString();
    };

    return (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
            <tr className="border-b text-left">
        <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Email</th>
        <th className="py-2 pr-4 font-medium">Role</th>
        <th className="py-2 pr-4 font-medium">Address</th>
        <th className="py-2 pr-4 font-medium">Created</th>
        </tr>
        </thead>
        <tbody>
        {users.map((user, index) => {
                const key = user.id ?? user.email ?? `user-${index}`;

                return (
                    <tr key={key} className="border-b last:border-0">
                <td className="py-2 pr-4">{user.name || "—"}</td>
                    <td className="py-2 pr-4">{user.email || "—"}</td>
                    <td className="py-2 pr-4">{user.role}</td>
                    <td className="py-2 pr-4">{user.address || "—"}</td>
                    <td className="py-2 pr-4">{formatCreatedAt(user.createdAt)}</td>
                </tr>
            );
            })}
        </tbody>
        </table>
        </div>
);
}