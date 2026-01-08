//handles the heavy implementation of authentication
//imports the authentication rules in authConfig

import NextAuth from "next-auth";//main framework function
import Credentials from "next-auth/providers/credentials"; //Credentials is the specific login method for email and password
import { authConfig } from "./auth.config"; //contains the lightweight auth rules
import { UserModel } from "@/Models/User"; //User DB schema
import bcrypt from "bcryptjs"; //library to hash passwords and compare hashed passwords
import { connectDB } from "@/lib/db";

/*
handler: used by the API route: api/auth/[...nextauth/route.ts]
signIn: function used in authActions to log users in
signOut: function to log users out
auth: function to get the current user session (used in app/page.tsx and bookingActions.ts)
*/
export const { handlers, signIn, signOut, auth } = NextAuth({
    //merge authconfig using spread operator
    //pulls in 'pages' settings and 'authorized' rule from authConfig
    ...authConfig,

    //serves as the "Menu" of login options, we only have one: Credentials.
    providers: [
        Credentials({
            name: "Credentials",

            //this object defines what inputs the NextAuth form needs
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            //this function runs when `signIn(credentials)` is called in authActions
            async authorize(credentials) {
                // 1. Validate that credentials exist and are strings
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await connectDB(); 

                // 2. Cast to string to fix the "Type unknown is not assignable" error
                const user = await UserModel.findOne({ email: credentials.email as string });
                
                if (!user) return null;
                
                const passwordMatch = await bcrypt.compare(
                    credentials.password as string, 
                    user.password
                );

                if (passwordMatch) {
                    // Return an object that matches the NextAuth User type
                    return { 
                        id: user._id.toString(), 
                        name: user.name, 
                        email: user.email 
                    };
                }
                return null;
            }
        })
    ],
    // We merge our callbacks with the base ones from authConfig
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
    },
    session: { strategy: "jwt" },
});