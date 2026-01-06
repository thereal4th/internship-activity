// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/app/auth" // This imports the GET and POST handlers we defined in your auth.ts
export const { GET, POST } = handlers