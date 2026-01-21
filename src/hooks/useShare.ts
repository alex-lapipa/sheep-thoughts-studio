import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  contentType?: string;
  contentId?: string;
}

interface UseShareOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  copySuccessMessage?: string;
}

interface UseShareReturn {
  share: (data: ShareData) => Promise<boolean>;
  copyToClipboard: (text: string, contentType?: string, contentTitle?: string, contentId?: string) => Promise<boolean>;
  isSharing: boolean;
  isCopied: boolean;
  canShare: boolean;
}

// Record share event in database
async function recordShare(
  contentType: string,
  shareMethod: string,
  contentTitle?: string,
  contentId?: string
) {
  try {
    await supabase.from('share_events').insert({
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
      share_method: shareMethod,
    });
  } catch (error) {
    console.error('Failed to record share:', error);
  }
}

export function useShare(options: UseShareOptions = {}): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const {
    onSuccess,
    onError,
    successMessage = "Shared successfully!",
    copySuccessMessage = "Copied to clipboard!",
  } = options;

  // Check if Web Share API is available
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const copyToClipboard = useCallback(async (
    text: string,
    contentType = "general",
    contentTitle?: string,
    contentId?: string
  ): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success(copySuccessMessage);
      setTimeout(() => setIsCopied(false), 2000);
      
      // Record the share
      await recordShare(contentType, "clipboard", contentTitle, contentId);
      
      onSuccess?.();
      return true;
    } catch (error) {
      toast.error("Unable to copy to clipboard");
      onError?.(error as Error);
      return false;
    }
  }, [copySuccessMessage, onSuccess, onError]);

  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    if (isSharing) return false;

    const { contentType = "general", contentId, ...shareData } = data;

    setIsSharing(true);

    try {
      // Use Web Share API if available and data is shareable
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast.success(successMessage);
        
        // Record the share
        await recordShare(contentType, "native", shareData.title, contentId);
        
        onSuccess?.();
        setIsSharing(false);
        return true;
      }

      // Fallback to clipboard with URL or text
      const textToCopy = shareData.url || shareData.text || shareData.title || "";
      if (textToCopy) {
        const result = await copyToClipboard(textToCopy, contentType, shareData.title, contentId);
        setIsSharing(false);
        return result;
      }

      toast.error("Nothing to share");
      setIsSharing(false);
      return false;
    } catch (error) {
      // User cancelled share (AbortError) - silent fail
      if ((error as Error).name === "AbortError") {
        setIsSharing(false);
        return false;
      }

      // Try clipboard as fallback
      const textToCopy = shareData.url || shareData.text || shareData.title || "";
      if (textToCopy) {
        try {
          const result = await copyToClipboard(textToCopy, contentType, shareData.title, contentId);
          setIsSharing(false);
          return result;
        } catch {
          toast.error("Unable to share or copy");
          onError?.(error as Error);
        }
      } else {
        toast.error("Unable to share");
        onError?.(error as Error);
      }

      setIsSharing(false);
      return false;
    }
  }, [isSharing, successMessage, copyToClipboard, onSuccess, onError]);

  return {
    share,
    copyToClipboard,
    isSharing,
    isCopied,
    canShare,
  };
}
