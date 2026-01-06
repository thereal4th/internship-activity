// app/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = 
        nextUrl.pathname.startsWith("/Booking") || 
        nextUrl.pathname.startsWith("/MyBookings");

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirects to /login
      }
      return true;
    },
  },
  providers: [], // Keep this empty here
} satisfies NextAuthConfig;