import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { updateProviderProfile } from "@/lib/actions";
import { notFound, redirect } from "next/navigation";

export default async function ProviderProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "PROVIDER") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      providerProfile: true,
    },
  });

  if (!user || !user.providerProfile) {
    notFound();
  }

  const provider = user.providerProfile;

  const accountStatus = provider.isVerified
    ? "Verified"
    : user.status === "REJECTED"
      ? "Rejected"
      : "Pending Review";

  const accountStatusClass = provider.isVerified
    ? "bg-green-700 text-green-100 hover:bg-green-700"
    : user.status === "REJECTED"
      ? "bg-red-700 text-red-100 hover:bg-red-700"
      : "bg-yellow-700 text-yellow-100 hover:bg-yellow-700";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">My Profile</h1>

        <p className="text-muted-foreground">
          View and update your provider contact and account information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>

            <CardDescription>
              Update your contact name, phone number and address.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action={updateProviderProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contact Name</Label>

                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name ?? ""}
                  placeholder="Contact person name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerName">
                  Camp or Business Name
                </Label>

                <Input
                  id="providerName"
                  value={provider.name}
                  disabled
                  readOnly
                />

                <p className="text-xs text-muted-foreground">
                  The business name can only be changed by an
                  administrator.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>

                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={provider.phone}
                  placeholder="+387..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>

                <Input
                  id="address"
                  name="address"
                  defaultValue={provider.address}
                  placeholder="Provider address"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>

            <CardDescription>
              Provider registration and verification details.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Email
              </Label>

              <p className="break-all font-medium">
                {user.email ?? "Not provided"}
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                ID / Business Number
              </Label>

              <p className="font-medium">
                {provider.businessIdentifier ?? "Not provided"}
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                User Role
              </Label>

              <p className="font-medium">{user.role}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Verification
              </Label>

              <div>
                <Badge className={accountStatusClass}>
                  {accountStatus}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Registered
              </Label>

              <p className="font-medium">
                {provider.createdAt.toLocaleDateString("en-GB")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}