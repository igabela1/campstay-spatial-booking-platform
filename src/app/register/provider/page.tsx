"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerProvider } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const providerRegisterSchema = z.object({
  providerName: z
    .string()
    .trim()
    .min(1, "Camp or business name is required."),

  contactName: z
    .string()
    .trim()
    .min(1, "Contact person name is required."),

  email: z
    .string()
    .trim()
    .email("A valid email address is required."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),

  phone: z
    .string()
    .trim()
    .min(6, "A valid phone number is required."),

  address: z
    .string()
    .trim()
    .min(1, "Address is required."),

  nic: z
    .string()
    .trim()
    .min(3, "ID or business number is required."),

  propertyInfo: z
    .string()
    .trim()
    .optional(),

  agreedToTerms: z
    .boolean()
    .refine((value) => value, {
      message: "You must agree to the terms and conditions.",
    }),
});

type ProviderRegisterValues = z.infer<
  typeof providerRegisterSchema
>;

export default function ProviderRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ProviderRegisterValues>({
    resolver: zodResolver(providerRegisterSchema),

    defaultValues: {
      providerName: "",
      contactName: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      nic: "",
      propertyInfo: "",
      agreedToTerms: false,
    },
  });

  const onSubmit = async (
    values: ProviderRegisterValues
  ) => {
    try {
      const result = await registerProvider(values);

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: result.message,
        });

        return;
      }

      toast({
        title: "Registration submitted",
        description:
          "Your provider account is waiting for administrator approval.",
      });

      router.push("/provider/pending");
      router.refresh();
    } catch (error) {
      console.error("Provider registration error:", error);

      toast({
        variant: "destructive",
        title: "Registration error",
        description:
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Auto Kamp Miris Ljeta"
            width={60}
            height={60}
            priority
            className="h-[60px] w-[60px] rounded-full object-cover"
          />

          <div className="text-left">
            <h1 className="text-xl font-bold">
              Miris Ljeta
            </h1>

            <p className="text-sm text-muted-foreground">
              Accommodation provider registration
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Register as Accommodation Provider
            </CardTitle>

            <CardDescription>
              Register your camp, bungalow, apartment, camper
              pitch or other small accommodation facility.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6 rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-semibold">
                Provider account
              </p>

              <p className="mt-2 text-muted-foreground">
                After administrator approval, you will be able
                to add accommodation units, define spatial
                characteristics, manage reservations and review
                guests after their stay.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Login Email</FormLabel>

                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="your-email@example.com"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>

                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Minimum 8 characters"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="providerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Camp or Business Name
                        </FormLabel>

                        <FormControl>
                          <Input
                            placeholder="e.g. Auto Kamp Miris Ljeta"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contact Person Name
                        </FormLabel>

                        <FormControl>
                          <Input
                            autoComplete="name"
                            placeholder="e.g. Ilhana Gabela"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>

                        <FormControl>
                          <Input
                            type="tel"
                            autoComplete="tel"
                            placeholder="+387..."
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          ID / Business Number
                        </FormLabel>

                        <FormControl>
                          <Input
                            placeholder="Identification or registration number"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Camp or Business Address
                      </FormLabel>

                      <FormControl>
                        <Input
                          autoComplete="street-address"
                          placeholder="Jablaničko jezero, Bosnia and Herzegovina"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        About Your Accommodation
                      </FormLabel>

                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Describe accommodation units, facilities, location, rules and available services."
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreedToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked === true);
                          }}
                        />
                      </FormControl>

                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the{" "}
                          <Link
                            href="/terms"
                            className="text-primary underline underline-offset-4"
                          >
                            terms and conditions
                          </Link>
                          .
                        </FormLabel>

                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Submitting registration..."
                    : "Submit for Approval"}
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}