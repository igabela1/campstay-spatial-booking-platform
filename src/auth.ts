// src/auth.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcryptjs from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { Role, UserStatus, User } from "@prisma/client";
import { authConfig } from "./auth.config";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          if (
            !credentials?.email ||
            !credentials?.password
          ) {
            console.log(
              "LOGIN FAILED: Email or password missing."
            );

            return null;
          }

          const email = String(
            credentials.email
          )
            .trim()
            .toLowerCase();

          const password = String(
            credentials.password
          );

          console.log(
            "LOGIN ATTEMPT:",
            email
          );

          const user =
            await prisma.user.findUnique({
              where: {
                email,
              },
            });

          if (!user) {
            console.log(
              "LOGIN FAILED: User not found:",
              email
            );

            return null;
          }

          console.log(
            "USER FOUND:",
            {
              email: user.email,
              role: user.role,
              status: user.status,
              hasPassword: Boolean(
                user.password
              ),
            }
          );

          if (!user.password) {
            console.log(
              "LOGIN FAILED: User has no password."
            );

            return null;
          }

          const isPasswordCorrect =
            await bcryptjs.compare(
              password,
              user.password
            );

          if (!isPasswordCorrect) {
            console.log(
              "LOGIN FAILED: Incorrect password for:",
              email
            );

            return null;
          }

          if (
            user.status !==
            UserStatus.APPROVED
          ) {
            console.log(
              "LOGIN FAILED: Account is not approved:",
              user.status
            );

            return null;
          }

          console.log(
            "LOGIN SUCCESS:",
            {
              email: user.email,
              role: user.role,
              status: user.status,
            }
          );

          return user;
        } catch (error) {
          console.error(
            "LOGIN ERROR:",
            error
          );

          return null;
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async jwt({
      token,
      user,
    }: {
      token: any;
      user?: any;
    }) {
      if (user) {
        const dbUser = user as User;

        token.id = dbUser.id;
        token.role = dbUser.role;
        token.status = dbUser.status;
      }

      return token;
    },

    async session({
      session,
      token,
    }: {
      session: any;
      token: any;
    }) {
      if (
        session.user &&
        token
      ) {
        session.user.id =
          token.id as string;

        session.user.role =
          token.role as Role;

        session.user.status =
          token.status as UserStatus;
      }

      return session;
    },
  },
});