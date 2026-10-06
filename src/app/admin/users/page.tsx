import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@prisma/client";

import {
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "@/app/admin/users/actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p>You must be an admin.</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Users</h1>
        <p className="text-muted-foreground">
          Manage users, roles and statuses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid gap-4 rounded-lg border p-4 lg:grid-cols-4 lg:items-center"
              >
                <div>
                  <p className="font-semibold">
                    {user.name || "No name"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    ID: {user.id}
                  </p>
                </div>

                <form
                  action={updateUserRole}
                  className="flex items-center gap-2"
                >
                  <input
                    type="hidden"
                    name="userId"
                    value={user.id}
                  />

                  <select
                    name="role"
                    defaultValue={user.role}
                    className="rounded-md border px-3 py-2"
                  >
                    {Object.values(Role).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

                  <Button type="submit" size="sm">
                    Save Role
                  </Button>
                </form>

                <form
                  action={updateUserStatus}
                  className="flex items-center gap-2"
                >
                  <input
                    type="hidden"
                    name="userId"
                    value={user.id}
                  />

                  <select
                    name="status"
                    defaultValue={user.status}
                    className="rounded-md border px-3 py-2"
                  >
                    {Object.values(UserStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <Button type="submit" size="sm">
                    Save Status
                  </Button>
                </form>

                <form action={deleteUser}>
                  <input
                    type="hidden"
                    name="userId"
                    value={user.id}
                  />

                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}