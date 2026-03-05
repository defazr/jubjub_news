"use client";

import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";

interface Props {
  translated: boolean;
  translating: boolean;
  targetLabel: string;
  onToggle: () => void;
}

export default function TranslateButton({ translated, translating, targetLabel, onToggle }: Props) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      disabled={translating}
      className="gap-1.5 shrink-0"
    >
      {translating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Languages className="h-4 w-4" />
      )}
      {translating ? "번역 중..." : translated ? "원문 보기" : targetLabel}
    </Button>
  );
}
