export default function ErrorBlock({ message }: { message?: string }) {
  return (
    <div className="rounded-[24px] border border-red-400/20 bg-red-500/10 p-5 text-center text-red-200">
      {message || "Bir hata oluştu"}
    </div>
  );
}
