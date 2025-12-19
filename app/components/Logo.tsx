import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center justify-center gap-4">
      <Image src="/logo.png" alt="Paycort Logo" width={40} height={40} />
      <p className="font-bold text-2xl text-white">PAYCORT</p>
    </div>
  );
}