import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus, 
  MoreHorizontal, 
  FileText, 
  Copy, 
  Trash2, 
  Edit, 
  Eye,
  Tag,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  preview_text: string | null;
  description: string | null;
  category: string | null;
  merge_tags: string[] | null;
  is_active: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

const AVAILABLE_MERGE_TAGS = [
  { tag: '{{email}}', description: 'Subscriber email address' },
  { tag: '{{unsubscribe_url}}', description: 'One-click unsubscribe link' },
  { tag: '{{current_date}}', description: 'Current date' },
  { tag: '{{current_year}}', description: 'Current year' },
  { tag: '{{company_name}}', description: 'Company name (Bubbles)' },
  { tag: '{{website_url}}', description: 'Website URL' },
];

const CATEGORIES = ['general', 'promotional', 'transactional', 'announcement', 'welcome'];

export default function AdminTemplates() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
    preview_text: '',
    description: '',
    category: 'general',
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const usedTags = AVAILABLE_MERGE_TAGS
        .filter(t => data.html_content.includes(t.tag) || data.subject.includes(t.tag))
        .map(t => t.tag);
      
      const { error } = await supabase.from('email_templates').insert({
        name: data.name,
        subject: data.subject,
        html_content: data.html_content,
        preview_text: data.preview_text || null,
        description: data.description || null,
        category: data.category,
        merge_tags: usedTags,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setCreateDialogOpen(false);
      resetForm();
      toast.success('Template created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const usedTags = AVAILABLE_MERGE_TAGS
        .filter(t => data.html_content.includes(t.tag) || data.subject.includes(t.tag))
        .map(t => t.tag);

      const { error } = await supabase
        .from('email_templates')
        .update({
          name: data.name,
          subject: data.subject,
          html_content: data.html_content,
          preview_text: data.preview_text || null,
          description: data.description || null,
          category: data.category,
          merge_tags: usedTags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setEditDialogOpen(false);
      setSelectedTemplate(null);
      resetForm();
      toast.success('Template updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (template: EmailTemplate) => {
      const { error } = await supabase.from('email_templates').insert({
        name: `${template.name} (Copy)`,
        subject: template.subject,
        html_content: template.html_content,
        preview_text: template.preview_text,
        description: template.description,
        category: template.category,
        merge_tags: template.merge_tags,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template duplicated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate template: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      html_content: '',
      preview_text: '',
      description: '',
      category: 'general',
    });
  };

  const openEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      preview_text: template.preview_text || '',
      description: template.description || '',
      category: template.category || 'general',
    });
    setEditDialogOpen(true);
  };

  const openPreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };


  const getCategoryBadge = (category: string | null) => {
    const colors: Record<string, string> = {
      general: 'bg-muted text-muted-foreground',
      promotional: 'bg-primary/10 text-primary',
      transactional: 'bg-accent/10 text-accent',
      announcement: 'bg-warning/10 text-warning',
      welcome: 'bg-secondary/50 text-secondary-foreground',
    };
    return (
      <Badge className={colors[category || 'general'] || colors.general}>
        {category || 'general'}
      </Badge>
    );
  };

  const renderPreviewContent = (content: string) => {
    let preview = content;
    preview = preview.replace(/\{\{email\}\}/g, 'subscriber@example.com');
    preview = preview.replace(/\{\{unsubscribe_url\}\}/g, '#');
    preview = preview.replace(/\{\{current_date\}\}/g, format(new Date(), 'MMMM d, yyyy'));
    preview = preview.replace(/\{\{current_year\}\}/g, new Date().getFullYear().toString());
    preview = preview.replace(/\{\{company_name\}\}/g, 'Bubbles');
    preview = preview.replace(/\{\{website_url\}\}/g, 'https://bubblesheep.xyz');
    return preview;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Templates</h1>
            <p className="text-muted-foreground">
              Create reusable templates with merge tags for campaigns
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Merge Tags Reference */}
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-primary" />
            <span className="font-medium">Available Merge Tags</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to copy. Use these in your template content.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_MERGE_TAGS.map((item) => (
              <TooltipProvider key={item.tag}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(item.tag);
                        toast.success(`Copied ${item.tag}`);
                      }}
                    >
                      {item.tag}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-card border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Merge Tags</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading templates...
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No templates yet</p>
                    <p className="text-sm">Create your first template to get started</p>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{template.subject}</TableCell>
                    <TableCell>{getCategoryBadge(template.category)}</TableCell>
                    <TableCell>
                      {template.merge_tags && template.merge_tags.length > 0 ? (
                        <span className="text-sm text-muted-foreground">
                          {template.merge_tags.length} tag{template.merge_tags.length !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>{template.use_count}×</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(template.updated_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreview(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateMutation.mutate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm('Delete this template?')) {
                                deleteMutation.mutate(template.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
              <DialogDescription>
                Create a reusable email template with merge tags
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    placeholder="Welcome Email"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="Welcome to Bubbles, {{email}}!"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preview_text">Preview Text (optional)</Label>
                <Input
                  id="preview_text"
                  placeholder="The text shown in email previews..."
                  value={formData.preview_text}
                  onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Content</Label>
                <RichTextEditor
                  content={formData.html_content}
                  onChange={(html) => setFormData({ ...formData, html_content: html })}
                  placeholder="Start writing your template..."
                />
                <p className="text-xs text-muted-foreground">
                  Use merge tags like {'{{email}}'} or {'{{unsubscribe_url}}'} in your content.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Internal notes about this template..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.name || !formData.subject || !formData.html_content || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update your email template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Template Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject Line</Label>
                <Input
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-preview_text">Preview Text</Label>
                <Input
                  id="edit-preview_text"
                  value={formData.preview_text}
                  onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Content</Label>
                <RichTextEditor
                  content={formData.html_content}
                  onChange={(html) => setFormData({ ...formData, html_content: html })}
                  placeholder="Edit your template content..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedTemplate && updateMutation.mutate({ id: selectedTemplate.id, data: formData })}
                disabled={!formData.name || !formData.subject || !formData.html_content || updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
              <DialogDescription>
                Subject: {selectedTemplate && renderPreviewContent(selectedTemplate.subject)}
              </DialogDescription>
            </DialogHeader>
            <div className="border rounded-lg p-4 bg-white">
              {selectedTemplate && (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: renderPreviewContent(selectedTemplate.html_content),
                  }}
                />
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                if (selectedTemplate) {
                  openEdit(selectedTemplate);
                  setPreviewDialogOpen(false);
                }
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
