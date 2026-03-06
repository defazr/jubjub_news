"use client";

import { useState } from "react";
import { Share2, Check, Link, Twitter } from "lucide-react";

interface Props {
  url: string;
  title: string;
  className?: string;
}

export default function ShareButton({ url, title, className = "" }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or not supported, fall through to menu
      }
    }
    setShowMenu(!showMenu);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    }
  }

  function handleTwitter() {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer,width=550,height=420");
    setShowMenu(false);
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleShare}
        className="p-1.5 rounded-full hover:bg-accent transition-colors"
        title="공유"
      >
        <Share2 className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden min-w-[140px] animate-slide-down">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Link className="h-3.5 w-3.5" />}
              {copied ? "복사됨!" : "링크 복사"}
            </button>
            <button
              onClick={handleTwitter}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
            >
              <Twitter className="h-3.5 w-3.5" />
              트위터
            </button>
          </div>
        </>
      )}
    </div>
  );
}
