"use client";

import { useState } from "react";
import { PAGE_LABELS } from "@/lib/pageAccess";
import type { SafeUser } from "@/lib/users";
import UserEditForm from "./UserEditForm";
import DeleteButton from "./DeleteButton";

// Renders the user rows and handles "Edit" as an in-page modal (not a
// separate route) — clicking Edit never navigates away from /admin/users.
export default function UsersList({
  users,
  currentEmail,
}: {
  users: SafeUser[];
  currentEmail?: string;
}) {
  const [editing, setEditing] = useState<SafeUser | null>(null);

  return (
    <>
      <div className="mt-6 space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-200 text-sm font-bold text-stone-600">
              {user.email.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-stone-900">{user.email}</p>
              <p className="text-sm text-stone-500">
                {user.role === "admin"
                  ? "Admin · full access"
                  : `Editor · ${
                      user.pages.length ? user.pages.map((p) => PAGE_LABELS[p]).join(", ") : "no pages yet"
                    }`}
                {" · added "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setEditing(user)}
                className="text-sm font-medium text-canal-blue hover:underline"
              >
                Edit
              </button>
              {currentEmail?.toLowerCase() === user.email.toLowerCase() ? (
                <span className="text-xs font-medium text-stone-400">This is you</span>
              ) : (
                <DeleteButton
                  url={`/api/admin/users/${user.id}`}
                  confirmMessage={`Remove ${user.email}? They'll immediately lose access.`}
                />
              )}
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
            No additional users yet — add one above.
          </p>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-stone-900">Edit User</p>
                <p className="truncate text-sm text-stone-500">{editing.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="shrink-0 rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              >
                ✕
              </button>
            </div>
            <UserEditForm user={editing} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </>
  );
}
