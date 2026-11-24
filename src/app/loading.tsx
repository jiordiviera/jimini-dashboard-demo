import { JiminiLoader } from "@/components/jimini-loader";

export default function Loading() {
  return (
    <div className="flex h-dvh items-center justify-center bg-jm-page">
      <JiminiLoader size="lg" />
    </div>
  );
}
