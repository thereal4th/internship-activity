//handles the heavy implementation of authentication
//imports the authentication rules in authConfig

import NextAuth from "next-auth";//main framework function
import Credentials from "next-auth/providers/credentials"; //Credentials is the specific login method for email and password
import { authConfig } from "./auth.config"; //contains the lightweight auth rules
import { UserModel } from "@/Models/User"; //User DB schema
import bcrypt from "bcryptjs"; //library to hash passwords and compare hashed passwords
import { connectDB } from "@/lib/db";

/*
NextAuth() generates functions and objects to be destructured and used in the program

providers[] = handlers
authorize() = signIn
session: "jwt" = signOut()
callbacks = auth()

handler: object used by the API route: api/auth/[...nextauth/route.ts], which tells the route how to handle GET and POST reqs
signIn: function used in authActions to log users in
signOut: function to log users out
auth: function to get the current user session (used in app/page.tsx and bookingActions.ts)
*/

export const { handlers, signIn, signOut, auth } = NextAuth({
    //merge authconfig using spread operator
    //pulls in 'pages' settings and 'authorized' rule from authConfig
    ...authConfig,

    //providers serve as the "Menu" of login options, we only have one provider: Credentials.
    //NextAuth() now knows to run the Credentials function when a user tries to log in with 'credentials'
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
                // 1. Validate that credentials exist
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await connectDB(); 

                // 2. Cast to string to fix the "Type unknown is not assignable" error
                const user = await UserModel.findOne({ email: credentials.email as string });
                
                if (!user) return null;
                
                //check if password matches
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
        ...authConfig.callbacks, //we pull and keep the existing callbacks like 'authorized' from authConfig
        
        //session callback (client helper)
        //this runs whenever 'auth()' is called in the app
        //takes the user-specified data from the token and makes it accessible to React components
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },

        //JWT callback (token builder)
        //This callback runs first, receives user object returned in 'authorize'
        //saves data into a JSON web token (encrypted cookie)
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },

        /*
        JWT vs SESSION

        jwt acts as the storage. User data such as ID, Role, etc are stuffed into the token, and then encrypted as a cookie
        why a cookie? because the web is stateless (no memory), and cookies can persist between page reloads

        session acts as a safe/secure display. When the frontend asks for who is logged in, NextAuth does not-
        hand over the JWT due to security, it returns the Session via a Session Callback. You can define inside the callback-
        what information it gets from the token.
        */
    },
    //explicitly tell nextauth to use JWT cookies instead of a Database Session Table
    session: { strategy: "jwt" },
});