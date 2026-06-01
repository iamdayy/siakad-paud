import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogIn, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { loginAction } from "../auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

async function LoginForm({
  searchParams,
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  const next =
    typeof searchParams?.next === "string" ? searchParams.next : "/dashboard";
  const error =
    typeof searchParams?.error === "string" ? searchParams.error : null;
  return (
    <form action={loginAction}>
      <CardContent className="space-y-5">
        {error && (
          <Alert variant="destructive" className="animate-fade-in-up">
            <AlertTitle>Gagal Login</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <input
            id="next"
            type="text"
            required
            name="next"
            hidden
            defaultValue={next}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            required
            name="username"
            placeholder="Masukkan username..."
            className="h-11 rounded-xl border-border/60 bg-background/50 backdrop-blur-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            required
            name="password"
            placeholder="••••••••"
            className="h-11 rounded-xl border-border/60 bg-background/50 backdrop-blur-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          className="w-full gap-2 h-11 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98] hover:shadow-lg"
        >
          <LogIn className="h-4 w-4" /> Masuk
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          Hubungi Admin jika Anda lupa kredensial akun.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </Button>
      </CardFooter>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-warm-blue/5 to-warm-pink/5" />
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-warm-pink/10 blur-3xl animate-pulse-soft delay-500" />
      <div className="absolute top-1/3 right-1/4 h-60 w-60 rounded-full bg-warm-yellow/8 blur-3xl animate-blob" />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <Card className="relative w-full max-w-[420px] animate-scale-in overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-2xl backdrop-blur-xl">
        {/* Decorative top gradient stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-warm-blue to-warm-pink" />

        <CardHeader className="space-y-4 pb-2 pt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-warm-green shadow-lg shadow-primary/20">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              SIAKAD PAUD
            </CardTitle>
            <CardDescription className="mt-1.5 text-sm">
              Sistem Informasi Akademik Terpadu
            </CardDescription>
          </div>
        </CardHeader>

        <Suspense
          fallback={<div className="p-4 text-center">Loading...</div>}
        >
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
