'use server';

import {signIn} from '@/app/auth'
import {AuthError} from 'next-auth';
import {connectDB} from '@/app/actions';
import {UserModel} from '@/Models/User';
import bcrypt from 'bcryptjs';

//ACTION: REGISTER USER
export async function registerUserAction(formData: FormData){
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if(!name || !email || !password){
        return {success: false, error: "All fields required"};
    }

    try{
        await connectDB();

        //check if user exists to avoid duplication
        const existingUser = await UserModel.findOne({email});

        if (existingUser){
            return{success: false, error: "Email already exists"};
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        //create user
        await UserModel.create({
            name,
            email,
            password: hashedPassword,
        });

        return{success: true}

    }
    catch(error){
        console.log("Registration error: ", error)
        return {success: false, error: "Failed to create account."}
    }
}

//ACTION: LOGIN USER WRAPPER

//wrap the nextauth signin function to handle errors
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/', // Redirect to home on success
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error; // Next.js redirects are thrown as errors, so we must re-throw them
  }
}