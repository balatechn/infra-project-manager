"use server"

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" }
    }
    // NextAuth throws a NEXT_REDIRECT error on success
    // which means the sign in actually worked
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      return { success: true }
    }
    return { success: false, error: "An unexpected error occurred" }
  }
}
