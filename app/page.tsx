"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Preloader from "@/app/components/Preloader";

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    const isAuth = sessionStorage.getItem("adminAuth");
    if (isAuth) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return <Preloader />;
}
