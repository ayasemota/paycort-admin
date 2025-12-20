import Link from "next/link";
import Logo from "./components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="flex flex-col items-center gap-6 sm:gap-8 text-center max-w-150">
        <div className="scale-75 sm:scale-100">
          <Logo />
        </div>
        <div className="flex flex-col gap-3 sm:gap-4">
          <h1 className="text-[80px] sm:text-[120px] md:text-[180px] font-bold text-green-200 leading-none">
            404!
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track!
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 bg-green-200 text-white px-6 py-3 rounded-lg hover:bg-green-100 transition-all duration-300">
          <Link href="/">Go Home</Link>
        </div>
      </div>
    </div>
  );
}