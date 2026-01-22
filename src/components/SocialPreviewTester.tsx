import { Button } from "@/components/ui/button";
import { ExternalLink, Facebook, Linkedin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SocialPreviewTesterProps {
  path?: string;
  className?: string;
}

const siteUrl = "https://sheep-thoughts-studio.lovable.app";

export function SocialPreviewTester({ path = "", className }: SocialPreviewTesterProps) {
  const fullUrl = `${siteUrl}${path}`;
  const encodedUrl = encodeURIComponent(fullUrl);

  const debuggers = [
    {
      name: "Facebook Debugger",
      url: `https://developers.facebook.com/tools/debug/?q=${encodedUrl}`,
      icon: Facebook,
    },
    {
      name: "LinkedIn Inspector",
      url: `https://www.linkedin.com/post-inspector/inspect/${encodedUrl}`,
      icon: Linkedin,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Test Social Preview
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {debuggers.map((debugger_) => (
          <DropdownMenuItem
            key={debugger_.name}
            onClick={() => window.open(debugger_.url, "_blank")}
            className="cursor-pointer"
          >
            <debugger_.icon className="h-4 w-4 mr-2" />
            {debugger_.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
