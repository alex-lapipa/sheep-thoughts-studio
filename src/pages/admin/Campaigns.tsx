import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  Plus,
  Send,
  MoreHorizontal,
  Edit,
  Trash2,
  TestTube,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  CalendarIcon,
  XCircle,
} from "lucide-react";
import { format, setHours, setMinutes, addDays, isBefore } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  subject: string;
  preview_text: string | null;
  html_content: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  recipient_count: number;
  delivered_count: number;
  failed_count: number;
}

export default function AdminCampaigns() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [testEmail, setTestEmail] = useState("");
  
  // Schedule state
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [scheduleHour, setScheduleHour] = useState("09");
  const [scheduleMinute, setScheduleMinute] = useState("00");
  
  const [formData, setFormData] = useState({
    subject: "",
    preview_text: "",
    html_content: "",
  });

  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const { data: subscriberCount } = useQuery({
    queryKey: ["active-subscriber-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      if (error) throw error;
      return count || 0;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("newsletter_campaigns").insert({
        subject: data.subject,
        preview_text: data.preview_text || null,
        html_content: data.html_content,
        status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Campaign created");
    },
    onError: () => toast.error("Failed to create campaign"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("newsletter_campaigns")
        .update({
          subject: data.subject,
          preview_text: data.preview_text || null,
          html_content: data.html_content,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      setIsEditOpen(false);
      resetForm();
      toast.success("Campaign updated");
    },
    onError: () => toast.error("Failed to update campaign"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("newsletter_campaigns")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Campaign deleted");
    },
    onError: () => toast.error("Failed to delete campaign"),
  });

  const sendTestMutation = useMutation({
    mutationFn: async ({ campaignId, email }: { campaignId: string; email: string }) => {
      const { data, error } = await supabase.functions.invoke("send-newsletter-campaign", {
        body: { campaignId, testEmail: email },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setIsTestOpen(false);
      setTestEmail("");
      toast.success("Test email sent!");
    },
    onError: (error) => toast.error(`Failed to send test: ${error.message}`),
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase.functions.invoke("send-newsletter-campaign", {
        body: { campaignId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      setIsSendConfirmOpen(false);
      setSelectedCampaign(null);
      toast.success(`Campaign sent! ${data.stats?.delivered || 0} emails delivered`);
    },
    onError: (error) => toast.error(`Failed to send campaign: ${error.message}`),
  });

  const scheduleMutation = useMutation({
    mutationFn: async ({ campaignId, scheduledAt }: { campaignId: string; scheduledAt: Date }) => {
      const { error } = await supabase
        .from("newsletter_campaigns")
        .update({
          scheduled_at: scheduledAt.toISOString(),
          status: "scheduled",
        })
        .eq("id", campaignId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      setIsScheduleOpen(false);
      setSelectedCampaign(null);
      toast.success("Campaign scheduled successfully");
    },
    onError: (error) => toast.error(`Failed to schedule campaign: ${error.message}`),
  });

  const cancelScheduleMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from("newsletter_campaigns")
        .update({
          scheduled_at: null,
          status: "draft",
        })
        .eq("id", campaignId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Schedule cancelled");
    },
    onError: (error) => toast.error(`Failed to cancel schedule: ${error.message}`),
  });

  const resetForm = () => {
    setFormData({ subject: "", preview_text: "", html_content: "" });
    setSelectedCampaign(null);
    setScheduleDate(addDays(new Date(), 1));
    setScheduleHour("09");
    setScheduleMinute("00");
  };

  const openEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      subject: campaign.subject,
      preview_text: campaign.preview_text || "",
      html_content: campaign.html_content,
    });
    setIsEditOpen(true);
  };

  const openTest = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsTestOpen(true);
  };

  const openSendConfirm = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsSendConfirmOpen(true);
  };

  const openSchedule = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    if (campaign.scheduled_at) {
      const date = new Date(campaign.scheduled_at);
      setScheduleDate(date);
      setScheduleHour(format(date, "HH"));
      setScheduleMinute(format(date, "mm"));
    } else {
      setScheduleDate(addDays(new Date(), 1));
      setScheduleHour("09");
      setScheduleMinute("00");
    }
    setIsScheduleOpen(true);
  };

  const openPreview = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsPreviewOpen(true);
  };

  const getScheduledDateTime = () => {
    if (!scheduleDate) return null;
    return setMinutes(setHours(scheduleDate, parseInt(scheduleHour)), parseInt(scheduleMinute));
  };

  const handleSchedule = () => {
    const scheduledAt = getScheduledDateTime();
    if (!scheduledAt || !selectedCampaign) return;
    
    if (isBefore(scheduledAt, new Date())) {
      toast.error("Scheduled time must be in the future");
      return;
    }
    
    scheduleMutation.mutate({ campaignId: selectedCampaign.id, scheduledAt });
  };

  const getStatusBadge = (status: string, campaign?: Campaign) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline"><Edit className="w-3 h-3 mr-1" />Draft</Badge>;
      case "scheduled":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <CalendarIcon className="w-3 h-3 mr-1" />
            {campaign?.scheduled_at ? format(new Date(campaign.scheduled_at), "MMM d, h:mm a") : "Scheduled"}
          </Badge>
        );
      case "sending":
        return <Badge className="bg-primary/10 text-primary border-primary/20"><Clock className="w-3 h-3 mr-1" />Sending</Badge>;
      case "sent":
        return <Badge className="bg-accent/10 text-accent border-accent/20"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: campaigns.length,
    draft: campaigns.filter(c => c.status === "draft").length,
    scheduled: campaigns.filter(c => c.status === "scheduled").length,
    sent: campaigns.filter(c => c.status === "sent").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Newsletter Campaigns</h1>
            <p className="text-muted-foreground">Create and send email campaigns to subscribers</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Subscribers</CardDescription>
              <CardTitle className="text-2xl">{subscriberCount || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Campaigns</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Draft</CardDescription>
              <CardTitle className="text-2xl">{stats.draft}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Scheduled</CardDescription>
              <CardTitle className="text-2xl">{stats.scheduled}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sent</CardDescription>
              <CardTitle className="text-2xl">{stats.sent}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading campaigns...
                    </TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No campaigns yet. Create your first one!
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.subject}</p>
                          {campaign.preview_text && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {campaign.preview_text}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status, campaign)}</TableCell>
                      <TableCell>{campaign.recipient_count || "-"}</TableCell>
                      <TableCell>
                        {campaign.status === "sent" ? (
                          <span className="text-primary">{campaign.delivered_count}</span>
                        ) : "-"}
                        {campaign.failed_count > 0 && (
                          <span className="text-destructive ml-1">({campaign.failed_count} failed)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(campaign.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openPreview(campaign)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            {(campaign.status === "draft" || campaign.status === "scheduled") && (
                              <>
                                <DropdownMenuItem onClick={() => openEdit(campaign)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openTest(campaign)}>
                                  <TestTube className="h-4 w-4 mr-2" />
                                  Send Test
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openSchedule(campaign)}>
                                  <CalendarIcon className="h-4 w-4 mr-2" />
                                  {campaign.status === "scheduled" ? "Reschedule" : "Schedule"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openSendConfirm(campaign)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Now
                                </DropdownMenuItem>
                                {campaign.status === "scheduled" && (
                                  <DropdownMenuItem 
                                    onClick={() => cancelScheduleMutation.mutate(campaign.id)}
                                    className="text-warning"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Schedule
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => deleteMutation.mutate(campaign.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Compose your newsletter campaign
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line *</Label>
                <Input
                  id="subject"
                  placeholder="🐑 Big news from the bog..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preview">Preview Text</Label>
                <Input
                  id="preview"
                  placeholder="The text that appears in email previews..."
                  value={formData.preview_text}
                  onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Email Content *</Label>
                <RichTextEditor
                  content={formData.html_content}
                  onChange={(html) => setFormData({ ...formData, html_content: html })}
                  placeholder="Start writing your newsletter..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.subject || !formData.html_content || createMutation.isPending}
              >
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject Line *</Label>
                <Input
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-preview">Preview Text</Label>
                <Input
                  id="edit-preview"
                  value={formData.preview_text}
                  onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Email Content *</Label>
                <RichTextEditor
                  content={formData.html_content}
                  onChange={(html) => setFormData({ ...formData, html_content: html })}
                  placeholder="Edit your newsletter content..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedCampaign && updateMutation.mutate({ id: selectedCampaign.id, data: formData })}
                disabled={!formData.subject || !formData.html_content || updateMutation.isPending}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Preview: {selectedCampaign?.subject}</DialogTitle>
            </DialogHeader>
            <div 
              className="bg-[#FFFDD0] p-6 rounded-lg border"
              dangerouslySetInnerHTML={{ __html: selectedCampaign?.html_content || "" }}
            />
          </DialogContent>
        </Dialog>

        {/* Test Email Dialog */}
        <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Test Email</DialogTitle>
              <DialogDescription>
                Send a test version of "{selectedCampaign?.subject}" to verify it looks correct
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTestOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedCampaign && sendTestMutation.mutate({ campaignId: selectedCampaign.id, email: testEmail })}
                disabled={!testEmail || sendTestMutation.isPending}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Confirmation Dialog */}
        <Dialog open={isSendConfirmOpen} onOpenChange={setIsSendConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Campaign?</DialogTitle>
              <DialogDescription>
                You're about to send "{selectedCampaign?.subject}" to {subscriberCount || 0} active subscribers. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{subscriberCount || 0} recipients</p>
                <p className="text-sm text-muted-foreground">Active subscribers will receive this email</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSendConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedCampaign && sendCampaignMutation.mutate(selectedCampaign.id)}
                disabled={sendCampaignMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {sendCampaignMutation.isPending ? "Sending..." : "Send Now"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedCampaign?.status === "scheduled" ? "Reschedule" : "Schedule"} Campaign
              </DialogTitle>
              <DialogDescription>
                Choose when to send "{selectedCampaign?.subject}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) => isBefore(date, new Date())}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <div className="flex gap-2">
                  <Select value={scheduleHour} onValueChange={setScheduleHour}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center text-lg">:</span>
                  <Select value={scheduleMinute} onValueChange={setScheduleMinute}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "15", "30", "45"].map((min) => (
                        <SelectItem key={min} value={min}>
                          {min}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {scheduleDate && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Campaign will be sent:</p>
                  <p className="font-medium">
                    {format(getScheduledDateTime() || new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={!scheduleDate || scheduleMutation.isPending}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {scheduleMutation.isPending ? "Scheduling..." : "Schedule Campaign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
