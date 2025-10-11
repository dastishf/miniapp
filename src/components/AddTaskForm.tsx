import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

interface AddTaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  editingTask?: Task | null;
  onUpdateTask?: (task: Task) => void;
  onCancelEdit?: () => void;
}

export function AddTaskForm({ onAddTask, editingTask, onUpdateTask, onCancelEdit }: AddTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(editingTask?.priority || 'medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    if (editingTask && onUpdateTask) {
      onUpdateTask({
        ...editingTask,
        title: title.trim(),
        description: description.trim() || undefined,
        priority
      });
      onCancelEdit?.();
    } else {
      onAddTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority
      });
    }

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setOpen(false);
  };

  const handleCancel = () => {
    setTitle(editingTask?.title || '');
    setDescription(editingTask?.description || '');
    setPriority(editingTask?.priority || 'medium');
    setOpen(false);
    onCancelEdit?.();
  };

  return (
    <Dialog open={open || !!editingTask} onOpenChange={editingTask ? undefined : setOpen}>
      {!editingTask && (
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[425px] mx-4">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          
          <div>
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()} className="flex-1">
              {editingTask ? 'Update' : 'Add'} Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
