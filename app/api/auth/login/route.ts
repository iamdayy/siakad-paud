import { authenticateUser, buildSessionCookie, setAuthCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = await authenticateUser(username, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Set JWT Cookie
    const token = await buildSessionCookie(user);
    await setAuthCookie(token);

    // Determine redirect
    let nextPath = "/dashboard";
    if (user.role === "ORANG_TUA") {
      nextPath = "/portal";
    }

    return NextResponse.json({ success: true, nextPath });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
