export type BubbleMode = 'innocent' | 'concerned' | 'triggered' | 'savage';

export interface ThoughtBubble {
  id: number;
  mode: BubbleMode;
  text: string;
}

export const thoughtBubbles: ThoughtBubble[] = [
  // Innocent Mode
  { id: 1, mode: 'innocent', text: "I wonder if clouds taste like cotton candy..." },
  { id: 2, mode: 'innocent', text: "Being fluffy is actually quite cozy." },
  { id: 3, mode: 'innocent', text: "Maybe the grass IS greener on the other side?" },
  { id: 4, mode: 'innocent', text: "I hope today is a good grass day." },
  { id: 5, mode: 'innocent', text: "What if butterflies think we're the weird ones?" },
  { id: 6, mode: 'innocent', text: "My wool looks particularly magnificent today." },
  { id: 7, mode: 'innocent', text: "I bet humans wish they could nap this much." },
  { id: 8, mode: 'innocent', text: "The fence seems so tall from down here." },
  
  // Concerned Mode
  { id: 9, mode: 'concerned', text: "Wait... was that the farmer or a wolf?" },
  { id: 10, mode: 'concerned', text: "I'm not sure that's the right kind of grass..." },
  { id: 11, mode: 'concerned', text: "Why is everyone looking at my wool like that?" },
  { id: 12, mode: 'concerned', text: "Did someone say... shearing season?" },
  { id: 13, mode: 'concerned', text: "That gate looks suspiciously open." },
  { id: 14, mode: 'concerned', text: "I don't like the way that dog is smiling." },
  { id: 15, mode: 'concerned', text: "Something about this field feels different today." },
  
  // Triggered Mode
  { id: 16, mode: 'triggered', text: "They called me... a regular sheep?" },
  { id: 17, mode: 'triggered', text: "Did they just... count me to fall asleep?" },
  { id: 18, mode: 'triggered', text: "'Baa' is NOT my whole vocabulary, thanks." },
  { id: 19, mode: 'triggered', text: "I am NOT just a fluffy pillow with legs." },
  { id: 20, mode: 'triggered', text: "Stop comparing me to a cloud. I have depth." },
  { id: 21, mode: 'triggered', text: "They said all sheep look the same. EXCUSE ME?" },
  { id: 22, mode: 'triggered', text: "Sweater material? I'LL SHOW YOU SWEATER MATERIAL." },
  
  // Savage Mode
  { id: 23, mode: 'savage', text: "Your fashion sense is why I left the flock." },
  { id: 24, mode: 'savage', text: "I've met smarter fences." },
  { id: 25, mode: 'savage', text: "Even wolves find you boring." },
  { id: 26, mode: 'savage', text: "My wool has more personality than your wardrobe." },
  { id: 27, mode: 'savage', text: "I'm not following the herd. I AM the herd." },
  { id: 28, mode: 'savage', text: "That's a bold statement for someone in headbutt range." },
  { id: 29, mode: 'savage', text: "I didn't choose the fluff life. It chose me." },
  { id: 30, mode: 'savage', text: "Keep staring. My wool is still more valuable." },
  { id: 31, mode: 'savage', text: "You think you're special? I've been counted millions of times." },
  { id: 32, mode: 'savage', text: "Shepherd? More like sheep-herded by ME." },
];

export function getRandomBubble(mode?: BubbleMode): ThoughtBubble {
  const filtered = mode ? thoughtBubbles.filter(b => b.mode === mode) : thoughtBubbles;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getBubblesByMode(mode: BubbleMode): ThoughtBubble[] {
  return thoughtBubbles.filter(b => b.mode === mode);
}
