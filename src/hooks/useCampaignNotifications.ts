import { useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface CampaignWarning {
  campaignId: string;
  subject: string;
  scheduledAt: Date;
}

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const WARNING_MINUTES = 5;

export function useCampaignNotifications() {
  const notifiedCampaignsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Could not play notification sound:", err);
      });
    }
  }, []);

  const showBrowserNotification = useCallback((campaign: CampaignWarning) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("📧 Campaign Sending Soon!", {
        body: `"${campaign.subject}" will be sent in ${WARNING_MINUTES} minutes`,
        icon: "/favicon.svg",
        tag: `campaign-${campaign.campaignId}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 30 seconds
      setTimeout(() => notification.close(), 30000);
    }
  }, []);

  const triggerWarning = useCallback((campaign: CampaignWarning) => {
    // Prevent duplicate notifications for the same campaign
    if (notifiedCampaignsRef.current.has(campaign.campaignId)) {
      return;
    }
    notifiedCampaignsRef.current.add(campaign.campaignId);

    // Play sound
    playNotificationSound();

    // Show browser notification
    showBrowserNotification(campaign);

    // Show in-app toast
    toast({
      title: "📧 Campaign Sending Soon!",
      description: `"${campaign.subject}" will be sent in ${WARNING_MINUTES} minutes`,
      duration: 15000,
    });
  }, [playNotificationSound, showBrowserNotification]);

  const checkForUpcomingCampaigns = useCallback((campaigns: Array<{
    id: string;
    subject: string;
    scheduled_at: string | null;
    status: string;
  }>) => {
    const now = new Date();
    const warningThreshold = WARNING_MINUTES * 60 * 1000; // 5 minutes in ms

    campaigns
      .filter((c) => c.status === "scheduled" && c.scheduled_at)
      .forEach((campaign) => {
        const scheduledAt = new Date(campaign.scheduled_at!);
        const timeUntilSend = scheduledAt.getTime() - now.getTime();

        // Trigger if within warning window but not yet passed
        if (timeUntilSend > 0 && timeUntilSend <= warningThreshold) {
          triggerWarning({
            campaignId: campaign.id,
            subject: campaign.subject,
            scheduledAt,
          });
        }
      });
  }, [triggerWarning]);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  const getNotificationPermission = useCallback(() => {
    if ("Notification" in window) {
      return Notification.permission;
    }
    return "denied";
  }, []);

  const clearNotifiedCampaign = useCallback((campaignId: string) => {
    notifiedCampaignsRef.current.delete(campaignId);
  }, []);

  return {
    checkForUpcomingCampaigns,
    triggerWarning,
    requestNotificationPermission,
    getNotificationPermission,
    clearNotifiedCampaign,
    playNotificationSound,
  };
}
