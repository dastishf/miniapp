import { Card } from "./ui/card";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <Card className="p-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <Circle className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-2xl font-semibold">{activeTasks}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-2xl font-semibold">{completedTasks}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-2xl font-semibold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
      </Card>
    </div>
  );
}