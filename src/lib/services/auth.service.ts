import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export interface LoginResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    name: string;
    roles: string[];
  };
}

export async function loginService(
  login: string,
  password: string
): Promise<LoginResult> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: login,
        },
        {
          email: login,
        },
      ],
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    return {
      success: false,
      message: "Usuario o contraseña incorrectos",
    };
  }

  if (!user.status) {
    return {
      success: false,
      message: "El usuario se encuentra desactivado",
    };
  }

  const passwordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordCorrect) {
    return {
      success: false,
      message: "Usuario o contraseña incorrectos",
    };
  }

  return {
    success: true,
    message: "Inicio de sesión correcto",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      roles: user.roles.map(
        (userRole) => userRole.role.name
      ),
    },
  };
}