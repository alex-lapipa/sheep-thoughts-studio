import { motion } from "framer-motion";
import { MessageCircle, Heart, Sparkles, Users } from "lucide-react";

const PROOF_ITEMS = [
  {
    icon: MessageCircle,
    stat: "10K+",
    label: "Questions Answered",
    subtext: "All incorrectly",
  },
  {
    icon: Heart,
    stat: "99%",
    label: "Confidence Rate",
    subtext: "0% accuracy",
  },
  {
    icon: Users,
    stat: "7",
    label: "Human Mentors",
    subtext: "None qualified",
  },
  {
    icon: Sparkles,
    stat: "∞",
    label: "Wrong Takes",
    subtext: "And counting",
  },
];

export function WhyBubblesProof() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-display font-bold text-foreground">
            Why Trust Bubbles?
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            (You probably shouldn't, but here are the numbers anyway)
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PROOF_ITEMS.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center hover:border-accent/30 transition-colors">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent mb-3">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {item.stat}
                </div>
                <div className="text-sm font-medium text-foreground/80">
                  {item.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {item.subtext}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyBubblesProof;
