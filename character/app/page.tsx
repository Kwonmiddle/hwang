import { OtterCharacter } from "@/components/OtterCharacter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-lg font-semibold text-slate-200">
        첫 페이지 · 수달 캐릭터
      </h1>
      <OtterCharacter />
    </main>
  );
}
