"use client";

import type { UserData } from "@/hooks/use-userData";

type Props = {
    users: UserData[];
    selectedUserId?: string;
    onSelectUser: (user: UserData) => void;
};

export function UsersTable({
                               users,
                               selectedUserId,
                               onSelectUser,
                           }: Props) {
    const formatCreatedAt = (value: string | Date | null | undefined) => {
        if (!value) return "—";
        const date = value instanceof Date ? value : new Date(value);
        return date.toLocaleString();
    };

    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[950px] text-sm">
                <thead className="bg-muted/40">
                <tr className="text-left">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Role</th>
                    <th className="py-3 px-4 font-medium">Address</th>
                    <th className="py-3 px-4 font-medium">Created</th>
                    <th className="py-3 px-4 font-medium">Active</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user, index) => {
                    const key = user.id ?? user.email ?? `user-${index}`;
                    const isActive = !user.banned;
                    const isSelected = user.id === selectedUserId;

                    return (
                        <tr
                            key={key}
                            className={[
                                "cursor-pointer border-t transition-colors",
                                isSelected
                                    ? "bg-muted ring-1 ring-inset ring-border"
                                    : "hover:bg-muted/50",
                            ].join(" ")}
                            onClick={() => onSelectUser(user)}
                        >
                            <td className="py-3 px-4 font-medium">{user.name || "—"}</td>
                            <td className="py-3 px-4">{user.email || "—"}</td>
                            <td className="py-3 px-4 capitalize">{user.role}</td>
                            <td className="py-3 px-4">{user.address || "—"}</td>
                            <td className="py-3 px-4 whitespace-nowrap">
                                {formatCreatedAt(user.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                  <span
                      className={[
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                      ].join(" ")}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}