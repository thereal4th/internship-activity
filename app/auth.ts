// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { UserModel } from "@/Models/User";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db"; // <--- Import it here (adjust path if needed)

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // 1. REUSE CONNECTION LOGIC
                await connectDB(); 

                // 2. NOW IT IS SAFE TO USE MODELS
                const user = await UserModel.findOne({ email: credentials.email });
                
                if (!user) return null;
                
                const passwordMatch = await bcrypt.compare(
                    credentials.password as string, 
                    user.password
                );

                if (passwordMatch) {
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
    callbacks: {
        //ensure user ID is available in the session

        async session({session, token}){
            if (token.sub && session.user){
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({token, user}){
            if(user){
                token.sub = user.id;
            }
            return token;
        },
    },
    session: {strategy: "jwt"},
});