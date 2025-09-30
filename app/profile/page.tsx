"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/profile/simple");
  }, [router]);

  return <div>Redirecting...</div>;
}
