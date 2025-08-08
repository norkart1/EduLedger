import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CopyableAccountNumberProps {
  accountNumber: string;
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "code";
}

export function CopyableAccountNumber({ 
  accountNumber, 
  className, 
  showIcon = true,
  variant = "default" 
}: CopyableAccountNumberProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      toast({
        title: "Account Number Copied",
        description: "Account number has been copied to clipboard",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = accountNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      toast({
        title: "Account Number Copied",
        description: "Account number has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === "code") {
    return (
      <div 
        onClick={handleCopy}
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity",
          className
        )}
        title="Click to copy account number"
      >
        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
          {accountNumber}
        </code>
        {showIcon && (
          <div className="flex-shrink-0">
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      title="Click to copy account number"
    >
      <span className="text-sm sm:text-lg font-bold font-mono break-all">
        {accountNumber}
      </span>
      {showIcon && (
        <div className="flex-shrink-0">
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </div>
      )}
    </div>
  );
}