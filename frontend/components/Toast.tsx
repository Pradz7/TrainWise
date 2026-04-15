"use client";

type Props = {
  message: string;
  show: boolean;
};

export default function Toast({ message, show }: Props) {
  if (!show) return null;

  return (
    <div className="fixed right-6 top-6 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 shadow-lg">
      {message}
    </div>
  );
}