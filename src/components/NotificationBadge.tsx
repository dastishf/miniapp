import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";

interface NotificationBadgeProps {
  teamCode?: string;
  className?: string;
}

export function NotificationBadge({ teamCode, className = "" }: NotificationBadgeProps) {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!teamCode) return;

    const checkPendingRequests = () => {
      const requests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
      const pending = requests.filter((req: any) => 
        req.teamCode === teamCode && req.status === 'pending'
      );
      setPendingCount(pending.length);
    };

    checkPendingRequests();
    
    // Проверяем каждые 5 секунд
    const interval = setInterval(checkPendingRequests, 5000);
    
    return () => clearInterval(interval);
  }, [teamCode]);

  if (pendingCount === 0) return null;

  return (
    <Badge variant="destructive" className={`${className}`}>
      {pendingCount}
    </Badge>
  );
}

