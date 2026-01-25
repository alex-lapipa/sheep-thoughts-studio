import { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStoreOpsAgent, type AgentResponse, type OpsAction } from '@/hooks/useStoreOpsAgent';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Bot,
  Send,
  RefreshCw,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  ShieldCheck,
  XCircle,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: AgentResponse;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'Run Health Check', action: 'health_check', icon: Activity },
  { label: 'Generate Weekly Report', action: 'report', icon: FileText },
  { label: 'Check Checkout Config', action: 'checkout', icon: ShieldCheck },
  { label: 'Investigate Issues', action: 'investigate', icon: Search },
];

const SAMPLE_PROMPTS = [
  "Is checkout configured correctly for our main market?",
  "Which apps touch checkout/theme and are they healthy?",
  "What changed since last week?",
  "Why are orders stuck?",
  "Show me products with inventory issues",
  "Are there any webhook failures?",
];

export default function OpsAgentConsole() {
  const { user } = useAuth();
  const {
    isLoading,
    pendingActions,
    chat,
    runHealthCheck,
    getPendingActions,
    approveAction,
  } = useStoreOpsAgent();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'assist' | 'monitor' | 'execute'>('assist');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPendingActions();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await chat(userMessage.content, mode);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }]);
    }
  }

  async function handleQuickAction(action: string) {
    let prompt = '';
    switch (action) {
      case 'health_check':
        await runHealthCheck();
        toast.success('Health check completed');
        return;
      case 'report':
        prompt = 'Generate a weekly operations report for bubblesheep.xyz';
        break;
      case 'checkout':
        prompt = 'Is checkout configured correctly for our main market?';
        break;
      case 'investigate':
        prompt = 'What issues need attention right now?';
        break;
    }
    if (prompt) {
      setInput(prompt);
    }
  }

  async function handleApproveAction(actionId: string) {
    try {
      await approveAction(actionId);
    } catch (error) {
      // Error handled by hook
    }
  }

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-3">
              <Bot className="h-7 w-7 text-primary" />
              Ops Agent Console
            </h1>
            <p className="text-sm text-muted-foreground">
              Chat with the BUBBLESHEEP STORE OPS agent
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={mode === 'assist' ? 'default' : 'outline'}>
              {mode === 'assist' && <Sparkles className="h-3 w-3 mr-1" />}
              {mode === 'monitor' && <Activity className="h-3 w-3 mr-1" />}
              {mode === 'execute' && <Zap className="h-3 w-3 mr-1" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
            </Badge>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          {/* Main Chat Area */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="font-medium mb-2">Welcome to BUBBLESHEEP STORE OPS</h3>
                    <p className="text-sm mb-6">
                      I can help you monitor, validate, and optimize your Shopify store.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                      {SAMPLE_PROMPTS.map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setInput(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex gap-3',
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            'max-w-[80%] rounded-lg p-4',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p>{message.content}</p>
                          )}

                          {/* Response metadata */}
                          {message.response && (
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                              {message.response.sources.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium mb-1">Sources consulted:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {message.response.sources.map((s, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        [{s.namespace}] {s.title}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {message.response.actionsRequiringApproval.length > 0 && (
                                <div className="p-2 bg-warning/10 rounded border border-warning/20">
                                  <p className="text-xs font-medium text-warning flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Actions requiring approval:
                                  </p>
                                  {message.response.actionsRequiringApproval.map((a, i) => (
                                    <p key={i} className="text-xs mt-1">{a.description}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-xs opacity-50 mt-2">
                            {format(message.timestamp, 'HH:mm')}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <span className="text-xs text-primary-foreground font-medium">
                              {user?.email?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Thinking...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about store operations, health, or request actions..."
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Mode Selector */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Agent Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(['assist', 'monitor', 'execute'] as const).map((m) => (
                  <Button
                    key={m}
                    variant={mode === m ? 'default' : 'outline'}
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => setMode(m)}
                  >
                    {m === 'assist' && <Sparkles className="h-4 w-4 mr-2" />}
                    {m === 'monitor' && <Activity className="h-4 w-4 mr-2" />}
                    {m === 'execute' && <Zap className="h-4 w-4 mr-2" />}
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {QUICK_ACTIONS.map((action) => (
                  <Button
                    key={action.action}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    size="sm"
                    onClick={() => handleQuickAction(action.action)}
                    disabled={isLoading}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Pending Actions */}
            {pendingActions.length > 0 && (
              <Card className="border-warning">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Pending Approval
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingActions.map((action) => (
                    <div key={action.id} className="p-2 bg-warning/10 rounded text-xs">
                      <p className="font-medium">{action.action_title}</p>
                      <p className="text-muted-foreground">{action.action_description}</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => handleApproveAction(action.id)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs text-destructive"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}