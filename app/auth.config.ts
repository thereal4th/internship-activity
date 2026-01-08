/*
Exports a config object that defines the authentication rules and logic,-
imported by the middleware and auth.ts
*/

//import type definition from nextauth to ensure config object matches it
import type { NextAuthConfig } from "next-auth";

//intialize and export authConfig object
//contains authentication rules and logic that will be imported into middleware.ts and auth.ts
export const authConfig = {
  pages: {
    signIn: "/login", //if something goes wrong or user needs to sign in, they are sent to /app/login/page.tsx
  },

  //callback functions that run during specific authentication events
  callbacks: {
    //authorized function runs via Middleware on every request to the site
    //it decides if the user is allowed to see the page they requested
    authorized({ auth, request: { nextUrl } }) {
      //!! boolean conversion
      const isLoggedIn = !!auth?.user; //checks if auth.user exists

      //identify which pages are private/protected
      //this will return true if a user is visiting a private page
      const isProtectedRoute = 
        nextUrl.pathname.startsWith("/Booking") || 
        nextUrl.pathname.startsWith("/MyBookings");

      //check if user is accessing a protected route
      if (isProtectedRoute) {
        if (isLoggedIn) return true; //if logged in, let user pass
        return false; // Redirects to /login
      }

      //this is for public routes
      return true;
    },
  },
  // list of all authentication strategies (like oauth), keep empty for standard
  providers: [],

  //type validation using the type we imported
} satisfies NextAuthConfig;