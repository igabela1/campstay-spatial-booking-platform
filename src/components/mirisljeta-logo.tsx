import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export function MirisLjetaLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center", className)}
    >
      <Image
        src="/logo.jpg"
        alt="Miris Ljeta"
        width={100}
        height={100}
        priority
      />
    </Link>
  );
}