import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { UserModel } from "@/Models/User";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
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