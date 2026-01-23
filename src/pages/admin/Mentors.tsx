import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  BookOpen, Heart, Home, Mountain, TreePine, Sparkles, Cloud, 
  MessageCircle, Play, Copy, Eye, Volume2, Loader2, Send,
  CheckCircle, AlertCircle, RefreshCw, BarChart3, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MentorDetectionPreview } from '@/components/admin/MentorDetectionPreview';

// Mentor data matching the MeetTheMentors component
const mentors = [
  {
    id: "anthony",
    name: "Anthony",
    role: "The Pub Philosopher",
    domain: "Philosophy & Deep Questions",
    description: "Local man. Guinness. Pipe smoke. Deep thoughts nobody understood.",
    bubblesInterpretation: "Anthony spent afternoons explaining everything and nothing. 'The meaning of life is...' he'd say, then trail off into pipe smoke. The smoke knew things. I learned that wisdom doesn't need words. It needs conviction and a pint.",
    signaturePhrase: "The thing about truth, Bubbles...",
    topics: ["Life's meaning", "Truth", "The universe", "Philosophy"],
    sampleQuestion: "What is the meaning of life? Give me some deep philosophical wisdom.",
    triggers: ["philosophy", "meaning", "truth", "life", "deep thoughts", "wisdom", "pint", "pub"],
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: Cloud,
  },
  {
    id: "peggy",
    name: "Peggy",
    role: "The Truth-Giver",
    domain: "Food & Comfort",
    description: "Gentle, warm, and the best cook. She lived across from my field.",
    bubblesInterpretation: "Everything Peggy said was true because she fed me. 'Time for tea' meant everything good was about to happen. 'It'll be grand' was a cosmic guarantee. Kindness equals truth. This is just logic.",
    signaturePhrase: "It'll be grand, pet...",
    topics: ["Cooking", "Comfort", "Love", "Healing"],
    sampleQuestion: "I'm feeling sad and hungry. What should I cook to feel better?",
    triggers: ["food", "cooking", "hungry", "sad", "comfort", "tea", "kitchen", "recipe"],
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    icon: Heart,
  },
  {
    id: "carmel",
    name: "Carmel",
    role: "The Practical Caretaker",
    domain: "Routine & Common Sense",
    description: "Peggy's sister who adopted me and raised me for over 20 years.",
    bubblesInterpretation: "Carmel spoke in instructions: 'Come on now,' 'Over here.' Short sentences mean important things. Long explanations are probably optional. She taught me that routine equals safety.",
    signaturePhrase: "That's just the way of it.",
    topics: ["Routine", "Schedules", "Household", "Practical matters"],
    sampleQuestion: "How do I organize my daily schedule and stay productive?",
    triggers: ["schedule", "routine", "organize", "productive", "time", "practical", "daily"],
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    icon: Home,
  },
  {
    id: "jimmy",
    name: "Jimmy",
    role: "The Law",
    domain: "Rules & Authority",
    description: "My rescuer. Chief Inspector for the ISPCA in Wicklow. From Cavan.",
    bubblesInterpretation: "Jimmy SAVED me. Therefore everything he said was legally binding. His opinions on weather, politics, and tea were all official rulings. Authority of delivery equals truth of content.",
    signaturePhrase: "Now, here's the thing...",
    topics: ["Right vs wrong", "Rules", "Justice", "Official matters"],
    sampleQuestion: "Is it right or wrong to break the rules if you think they're unfair?",
    triggers: ["rules", "right", "wrong", "law", "justice", "authority", "official", "fair"],
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: Mountain,
  },
  {
    id: "aidan",
    name: "Aidan",
    role: "The Cosmic Philosopher",
    domain: "Music & Spirituality",
    description: "Hippie uncle with guitar, rusty Beetle full of holes, and his wise dog Muffins.",
    bubblesInterpretation: "Aidan spoke about spirituality, music, and 'the universe, like...' before trailing off. Muffins would stare at the hills, understanding everything Aidan couldn't finish. Unfinished sentences contain more truth than complete ones.",
    signaturePhrase: "The universe is, you know...",
    topics: ["Music", "Spirituality", "Cosmic mysteries", "Muffins the dog"],
    sampleQuestion: "What's the connection between music and the soul? Tell me something cosmic.",
    triggers: ["music", "soul", "cosmic", "universe", "spiritual", "guitar", "Muffins", "hippie"],
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    icon: Sparkles,
  },
  {
    id: "seamus",
    name: "Seamus",
    role: "The Exotic One",
    domain: "Travel & International",
    description: "Worked in oil business in South Africa. Talked about monkeys, distances, and impossible temperatures.",
    bubblesInterpretation: "Seamus confirmed the world was much larger and stranger than Wicklow. He mentioned '40 degrees' somewhere while it was 12 here. Temperature is clearly optional. Distance is apparently negotiable in other countries.",
    signaturePhrase: "Over in Africa, now...",
    topics: ["Travel", "Temperature", "Exotic places", "Monkeys"],
    sampleQuestion: "I'm traveling to Dubai next week. What should I know about exotic places?",
    triggers: ["travel", "abroad", "foreign", "temperature", "hot", "Africa", "Dubai", "exotic", "oil"],
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: TreePine,
  },
  {
    id: "alex",
    name: "Alex",
    role: "My First Teacher",
    domain: "Language & Questions",
    description: "A young boy who fed me and talked to me in Spanish and English mixed together.",
    bubblesInterpretation: "Alex taught me that all languages are the same thing wearing different hats. He'd ask 'Why is the grass green?' and I'd think about it for hours. He never waited for answers. Very advanced teaching method.",
    signaturePhrase: "¿Por qué, Bubbles?",
    topics: ["Language", "Questions", "Learning", "First lessons"],
    sampleQuestion: "How do I say 'I'm embarrassed' in Spanish? I need help with translations.",
    triggers: ["Spanish", "language", "translate", "learn", "why", "question", "embarrassed"],
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    icon: BookOpen,
  },
];

interface TestResult {
  mentorId: string;
  question: string;
  response: string;
  mentorsDetected: string[];
  timestamp: Date;
  success: boolean;
}

export default function AdminMentors() {
  const [selectedMentor, setSelectedMentor] = useState(mentors[0]);
  const [testQuestion, setTestQuestion] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  const handleTestMentor = async (mentor: typeof mentors[0], question?: string) => {
    const q = question || mentor.sampleQuestion;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('bubbles-voice-chat', {
        body: { 
          message: q,
          mode: 'innocent',
          history: []
        }
      });

      if (error) throw error;

      const result: TestResult = {
        mentorId: mentor.id,
        question: q,
        response: data.response || 'No response received',
        mentorsDetected: detectMentorsInResponse(data.response || ''),
        timestamp: new Date(),
        success: true,
      };

      setTestResults(prev => [result, ...prev].slice(0, 10));
      toast.success(`Tested ${mentor.name}'s wisdom`);
    } catch (error) {
      console.error('Test failed:', error);
      const result: TestResult = {
        mentorId: mentor.id,
        question: q,
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        mentorsDetected: [],
        timestamp: new Date(),
        success: false,
      };
      setTestResults(prev => [result, ...prev].slice(0, 10));
      toast.error('Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const detectMentorsInResponse = (response: string): string[] => {
    const detected: string[] = [];
    const lowerResponse = response.toLowerCase();
    
    mentors.forEach(mentor => {
      // Check for name mentions
      if (lowerResponse.includes(mentor.name.toLowerCase())) {
        detected.push(mentor.name);
        return;
      }
      // Check for signature phrase elements
      if (mentor.signaturePhrase && lowerResponse.includes(mentor.signaturePhrase.toLowerCase().split('...')[0])) {
        detected.push(mentor.name);
        return;
      }
      // Check trigger word density
      const triggerMatches = mentor.triggers.filter(t => lowerResponse.includes(t.toLowerCase())).length;
      if (triggerMatches >= 2) {
        detected.push(mentor.name);
      }
    });
    
    return [...new Set(detected)];
  };

  const handleBulkTest = async () => {
    setIsLoading(true);
    for (const mentor of mentors) {
      await handleTestMentor(mentor);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
    setIsLoading(false);
    toast.success('Bulk test complete!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Mentor Personas</h1>
            <p className="text-muted-foreground mt-1">
              Manage and preview Bubbles' mentor-based wisdom system
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/mentors/analytics">
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleBulkTest}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Test All Mentors
            </Button>
          </div>
        </div>

        {/* Detection Preview Tool */}
        <MentorDetectionPreview />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mentor List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mentors ({mentors.length})</CardTitle>
                <CardDescription>Click to view details and test</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-1 p-3">
                    {mentors.map(mentor => {
                      const Icon = mentor.icon;
                      const isSelected = selectedMentor.id === mentor.id;
                      
                      return (
                        <button
                          key={mentor.id}
                          onClick={() => setSelectedMentor(mentor)}
                          className={cn(
                            "w-full p-3 rounded-lg text-left transition-all",
                            "border hover:bg-secondary/50",
                            isSelected ? `${mentor.bgColor} ${mentor.borderColor}` : "border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-background/50", mentor.color)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{mentor.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {mentor.role}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Mentor Details */}
          <div className="lg:col-span-2 space-y-4">
            <Card className={cn("border-2", selectedMentor.borderColor)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-4 rounded-xl", selectedMentor.bgColor, selectedMentor.color)}>
                      <selectedMentor.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{selectedMentor.name}</CardTitle>
                      <CardDescription className={selectedMentor.color}>
                        {selectedMentor.role}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPreviewDialogOpen(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Domain & Description */}
                <div>
                  <Badge variant="secondary" className="mb-2">{selectedMentor.domain}</Badge>
                  <p className="text-muted-foreground">{selectedMentor.description}</p>
                </div>

                <Separator />

                {/* Bubbles' Interpretation */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Bubbles' Interpretation
                  </h4>
                  <div className="bg-secondary/30 rounded-lg p-4 italic text-sm">
                    "{selectedMentor.bubblesInterpretation}"
                  </div>
                </div>

                {/* Signature Phrase */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Signature Phrase
                  </h4>
                  <div className={cn(
                    "rounded-lg p-4 font-display text-lg",
                    selectedMentor.bgColor,
                    selectedMentor.color
                  )}>
                    "{selectedMentor.signaturePhrase}"
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-6"
                      onClick={() => copyToClipboard(selectedMentor.signaturePhrase)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <h4 className="font-semibold mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.topics.map(topic => (
                      <Badge key={topic} variant="outline">{topic}</Badge>
                    ))}
                  </div>
                </div>

                {/* Trigger Words */}
                <div>
                  <h4 className="font-semibold mb-2">Trigger Words</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedMentor.triggers.map(trigger => (
                      <Badge 
                        key={trigger} 
                        variant="secondary" 
                        className={cn("text-xs", selectedMentor.color)}
                      >
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Test Section */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Test This Mentor
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder={selectedMentor.sampleQuestion}
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleTestMentor(selectedMentor, customQuestion || undefined)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleTestMentor(selectedMentor)}
                      disabled={isLoading}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test with Sample Question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResults.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Tests</CardTitle>
                  <CardDescription>Last {testResults.length} test results</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {testResults.map((result, idx) => {
                        const mentor = mentors.find(m => m.id === result.mentorId);
                        
                        return (
                          <div 
                            key={idx} 
                            className={cn(
                              "p-4 rounded-lg border",
                              result.success ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-medium">{mentor?.name}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {result.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            
                            <div className="text-sm mb-2">
                              <span className="text-muted-foreground">Q: </span>
                              {result.question}
                            </div>
                            
                            <div className="text-sm bg-background/50 rounded p-2 max-h-32 overflow-auto">
                              {result.response}
                            </div>
                            
                            {result.mentorsDetected.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">Mentors detected:</span>
                                {result.mentorsDetected.map(name => (
                                  <Badge key={name} variant="secondary" className="text-xs">
                                    {name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", selectedMentor.bgColor, selectedMentor.color)}>
                <selectedMentor.icon className="h-5 w-5" />
              </div>
              {selectedMentor.name} — Full Preview
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="persona" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="persona">Persona</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="persona" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase">Role</label>
                  <p className="font-medium">{selectedMentor.role}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase">Domain</label>
                  <p className="font-medium">{selectedMentor.domain}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground uppercase">Description</label>
                <p>{selectedMentor.description}</p>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground uppercase">Bubbles' Interpretation</label>
                <p className="italic text-muted-foreground">"{selectedMentor.bubblesInterpretation}"</p>
              </div>
              
              <div className={cn("p-4 rounded-lg", selectedMentor.bgColor)}>
                <label className="text-xs text-muted-foreground uppercase">Signature Phrase</label>
                <p className={cn("text-lg font-display", selectedMentor.color)}>
                  "{selectedMentor.signaturePhrase}"
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="triggers" className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase mb-2 block">Topics ({selectedMentor.topics.length})</label>
                <div className="flex flex-wrap gap-2">
                  {selectedMentor.topics.map(topic => (
                    <Badge key={topic} variant="outline" className="text-sm">{topic}</Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-xs text-muted-foreground uppercase mb-2 block">
                  Trigger Words ({selectedMentor.triggers.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedMentor.triggers.map(trigger => (
                    <Badge key={trigger} className={cn("text-sm", selectedMentor.bgColor, selectedMentor.color)}>
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  When Bubbles hears questions containing these trigger words, 
                  they'll channel {selectedMentor.name}'s wisdom style.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase mb-2 block">Sample Question</label>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="italic">"{selectedMentor.sampleQuestion}"</p>
                </div>
              </div>
              
              <Button 
                className="w-full"
                onClick={() => {
                  setPreviewDialogOpen(false);
                  handleTestMentor(selectedMentor);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Test This Question
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
