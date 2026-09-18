import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "siskardex_session";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET no está configurado");
}

const SECRET_KEY = new TextEncoder().encode(secret);

export interface SessionData {
  userId: string;
  username: string;
  roles: string[];
}

export async function createSession(
  session: SessionData
) {
  const token = await new SignJWT({
    userId: session.userId,
    username: session.username,
    roles: session.roles,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      SECRET_KEY
    );

    if (
      typeof payload.userId !== "string" ||
      typeof payload.username !== "string" ||
      !Array.isArray(payload.roles)
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      username: payload.username,
      roles: payload.roles.map(String),
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}