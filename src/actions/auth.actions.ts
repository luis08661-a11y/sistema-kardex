"use server";

import { redirect } from "next/navigation";

import { loginSchema } from "@/lib/validators/login.schema";
import { loginService } from "@/lib/services/auth.service";
import {
  createSession,
  destroySession,
} from "@/lib/auth/session";

export type LoginState = {
  success: boolean;
  message: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const login = String(formData.get("login") ?? "");
  const password = String(formData.get("password") ?? "");

  const validation = loginSchema.safeParse({
    login,
    password,
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  try {
    const result = await loginService(
      validation.data.login,
      validation.data.password
    );

    if (!result.success || !result.user) {
      return {
        success: false,
        message: result.message,
      };
    }

    await createSession({
      userId: result.user.id,
      username: result.user.username,
      roles: result.user.roles,
    });
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      message: "Error interno del servidor",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();

  redirect("/login");
}