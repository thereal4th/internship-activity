//middleware catches a request before it reaches the site
//implements the logic and config grom authConfig
//decides if a user is allowed to visit a site

import NextAuth from "next-auth";
import { authConfig } from "./app/auth.config"; //import auth rules

//initialize and export middleware
//wraps authConfig into a function that Next.js middleware understands
//runs the callbacks inside authConfig
//no file imports this, Next.js imports this automatically
export default NextAuth(authConfig).auth; 

//scope configuration
//defines which files the middleware won't run on
export const config = {
  //run middleware on everything except paths that start with /api, /_next/static, /_next/image, etc
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], 
};