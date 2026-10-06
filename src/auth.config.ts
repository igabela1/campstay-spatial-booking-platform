// src/auth.config.ts

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [],

  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
    }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const role = auth?.user?.role;
      const status = auth?.user?.status;

      /* ------------------------------------------------------------ */
      /* LOGIN / REGISTER                                             */
      /* ------------------------------------------------------------ */

      if (
        pathname.startsWith("/login") ||
        pathname === "/register"
      ) {
        if (!isLoggedIn) {
          return true;
        }

        if (role === "ADMIN") {
          return Response.redirect(
            new URL(
              "/admin/dashboard",
              nextUrl
            )
          );
        }

        if (role === "PROVIDER") {
          if (status === "PENDING") {
            return Response.redirect(
              new URL(
                "/provider/pending",
                nextUrl
              )
            );
          }

          return Response.redirect(
            new URL(
              "/provider/dashboard",
              nextUrl
            )
          );
        }

        return Response.redirect(
          new URL("/", nextUrl)
        );
      }

      /* ------------------------------------------------------------ */
      /* PROVIDER REGISTRATION                                       */
      /* ------------------------------------------------------------ */

      if (
        pathname.startsWith(
          "/provider/register"
        )
      ) {
        if (!isLoggedIn) {
          return true;
        }

        return Response.redirect(
          new URL("/", nextUrl)
        );
      }

      /* ------------------------------------------------------------ */
      /* ADMIN ROUTES                                                */
      /* ------------------------------------------------------------ */

      if (
        pathname.startsWith("/admin")
      ) {
        if (!isLoggedIn) {
          return Response.redirect(
            new URL("/login", nextUrl)
          );
        }

        if (role !== "ADMIN") {
          return Response.redirect(
            new URL("/", nextUrl)
          );
        }

        return true;
      }

      /* ------------------------------------------------------------ */
      /* PROVIDER ROUTES                                             */
      /* ------------------------------------------------------------ */

      if (
        pathname.startsWith("/provider")
      ) {
        if (!isLoggedIn) {
          return Response.redirect(
            new URL("/login", nextUrl)
          );
        }

        if (role !== "PROVIDER") {
          return Response.redirect(
            new URL("/", nextUrl)
          );
        }

        if (
          status === "PENDING" &&
          pathname !== "/provider/pending"
        ) {
          return Response.redirect(
            new URL(
              "/provider/pending",
              nextUrl
            )
          );
        }

        if (
          status === "APPROVED" &&
          pathname === "/provider/pending"
        ) {
          return Response.redirect(
            new URL(
              "/provider/dashboard",
              nextUrl
            )
          );
        }

        if (status === "REJECTED") {
          return Response.redirect(
            new URL("/", nextUrl)
          );
        }

        return true;
      }

      /* ------------------------------------------------------------ */
      /* LOGGED-IN USER ROUTES                                       */
      /* ------------------------------------------------------------ */

      const protectedUserRoutes = [
        "/profile",
        "/my-reservations",
        "/my-favorites",
      ];

      const requiresLogin =
        protectedUserRoutes.some(
          (route) =>
            pathname === route ||
            pathname.startsWith(
              `${route}/`
            )
        );

      if (
        requiresLogin &&
        !isLoggedIn
      ) {
        return Response.redirect(
          new URL("/login", nextUrl)
        );
      }

      /* ------------------------------------------------------------ */
      /* PUBLIC ROUTES                                               */
      /* ------------------------------------------------------------ */

      return true;
    },

    async jwt({ token }) {
      return token;
    },

    async session({ session }) {
      return session;
    },
  },
} satisfies NextAuthConfig;