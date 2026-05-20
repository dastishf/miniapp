import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Plus, Mic, Loader2 } from "lucide-react";
import { parseVoiceTask } from "../services/aiService";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: string | null; // Добавили поле для дедлайна
}

interface AddTaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  editingTask?: Task | null;
  onUpdateTask?: (task: Task) => void;
  onCancelEdit?: () => void;
}

export function AddTaskForm({ onAddTask, editingTask, onUpdateTask, onCancelEdit }: AddTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState(''); // Стейт для дедлайна
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate || ''); // Подтягиваем дату
    }
  }, [editingTask]);

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setOpen(false);
    if (editingTask) onCancelEdit?.();
  };

  // ВОЗВРАЩЕННАЯ ОРИГИНАЛЬНАЯ ЛОГИКА МИКРОФОНА
  const handleVoiceInput = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Браузер не поддерживает голос. Попробуйте Chrome.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'ru-RU';
    rec.interimResults = false;

    setIsListening(true);

    rec.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Распознано голосом:", transcript);
      
      setIsListening(false);
      setIsProcessing(true);

      try {
        const aiResult = await parseVoiceTask(transcript);
        console.log("Ответ от ИИ:", aiResult);

        if (aiResult && typeof aiResult === 'object') {
          if (aiResult.title) setTitle(aiResult.title);
          if (aiResult.description) setDescription(aiResult.description);
          if (aiResult.priority) setPriority(aiResult.priority as any);
          
          // Сохраняем дату, если ИИ её нашел
          if (aiResult.dueDate) setDueDate(aiResult.dueDate); 
          
          if (!aiResult.description && transcript !== aiResult.title) {
            setDescription(transcript);
          }
        } else {
          setTitle(transcript);
        }
      } catch (err) {
        console.error("Ошибка при разборе ИИ:", err);
        setTitle(transcript);
      } finally {
        setIsProcessing(false);
      }
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined // Отправляем дату в базу
    };

    if (editingTask && onUpdateTask) {
      onUpdateTask({ ...editingTask, ...taskData });
    } else {
      onAddTask(taskData);
    }
    handleClose();
  };

  return (
    <Dialog open={open || !!editingTask} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      {!editingTask && (
        <DialogTrigger asChild onClick={() => setOpen(true)}>
          <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50" size="icon">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent 
        className="sm:max-w-[425px] mx-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{editingTask ? 'Изменить задачу' : 'Новая задача'}</DialogTitle>
            {!editingTask && (
              <Button 
                type="button" 
                variant={isListening ? "destructive" : "secondary"} 
                size="icon" 
                onClick={handleVoiceInput}
                disabled={isProcessing}
                className={isListening ? "animate-pulse" : ""}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <DialogDescription>
            Заполните поля вручную или используйте микрофон.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder={isProcessing ? "ИИ анализирует..." : "Название задачи"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isProcessing}
            required
          />
          
          <Textarea
            placeholder="Описание (необязательно)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={isProcessing}
          />
          
          {/* Блок со сроком и приоритетом */}
          <div className="flex gap-3">
            <div className="space-y-1 flex-1">
              <label className="text-xs text-muted-foreground uppercase font-bold">Срок (Дедлайн)</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-1 flex-1">
              <label className="text-xs text-muted-foreground uppercase font-bold">Приоритет</label>
              <select 
                className="w-full p-2 h-10 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                disabled={isProcessing}
              >
                <option value="low">Низкий (Low)</option>
                <option value="medium">Средний (Medium)</option>
                <option value="high">Высокий (High)</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" disabled={!title.trim() || isProcessing} className="flex-1">
              {editingTask ? 'Обновить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}