import { useState, useRef } from "react";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Trash2, Edit3, Calendar, Mic } from "lucide-react";
import { parseVoiceReport } from "../services/aiService"; 
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig"; 

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: string | null;
  report?: any;
  teamId?: string | null;
}

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onToggleComplete, onDelete, onEdit }: TaskItemProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const priorityColors = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-red-500'
  };

  const startVoiceReport = () => {
    // Если уже слушаем - принудительно останавливаем (отправит то, что успел)
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return; // onend сам поменяет стейт
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Ваш браузер не поддерживает голосовой ввод');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onerror = (event: any) => {
      console.error('Ошибка распознавания:', event.error);
      setIsListening(false);
    };

    recognition.onresult = async (event: any) => {
      if (!event.results || !event.results[0]) return;
      
      const transcript = event.results[0][0].transcript;
      console.log('Надиктован отчет:', transcript);
      if (!transcript.trim()) return;

      const reportData = await parseVoiceReport(transcript);
      
      if (reportData && task.teamId) {
        try {
          const taskRef = doc(db, 'tasks', task.id);
          await updateDoc(taskRef, {
            report: reportData,
            completed: reportData.status === 'success' ? true : task.completed
          });
          alert('Официальный отчет успешно добавлен!');
        } catch (error) {
          console.error("Ошибка при сохранении отчета в Firebase:", error);
        }
      } else if (reportData && !task.teamId) {
         alert('Голосовые отчеты пока работают только для командных задач (Firebase).');
      } else {
        alert('Не удалось сгенерировать отчет. Попробуйте еще раз.');
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <Card className={`p-4 border-l-4 ${priorityColors[task.priority]} ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`text-sm text-muted-foreground mt-1 ${task.completed ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {/* ОРИГИНАЛЬНЫЕ ЦВЕТА ПРИОРИТЕТОВ */}
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
              task.priority === 'high' ? 'bg-red-100 text-red-700' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
            </span>

            {/* ПРОСТО ЦВЕТНОЙ ТЕКСТ ДЕДЛАЙНА БЕЗ ФОНА (отлично работает в обеих темах) */}
            {task.dueDate && (
              <span className="flex items-center whitespace-nowrap text-xs font-bold text-blue-600 dark:text-blue-400">
                <Calendar className="h-3 w-3 mr-1" />
                Срок: {task.dueDate}
              </span>
            )}

            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Создано: {task.createdAt.toLocaleDateString()}
            </span>
          </div>

          {task.report && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md text-sm">
              <h4 className="font-bold text-slate-700 mb-2 border-b pb-1">Официальный отчет:</h4>
              <p className="mb-1 text-slate-600"><strong>Суть:</strong> {task.report.summary}</p>
              <p className="mb-1 text-slate-600"><strong>Детали:</strong> {task.report.technical_details}</p>
              <p className="mb-2 text-slate-600"><strong>Сотрудники:</strong> {task.report.detected_personnel}</p>
              <div>
                <span className={`inline-block px-2 py-1 rounded text-white text-xs mt-1 ${task.report.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {task.report.status === 'success' ? 'Выполнено штатно' : 'Требует внимания / Ошибка'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-1 flex-col sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={startVoiceReport}
            className={`h-8 px-2 text-xs border-purple-200 text-purple-700 hover:bg-purple-50 ${isListening ? 'animate-pulse bg-purple-100' : ''}`}
            title="Продиктовать отчет"
          >
            <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : 'mr-1'}`} />
            <span className="hidden sm:inline">{isListening ? 'Слушаю...' : 'Отчет'}</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="h-8 w-8 p-0">
            <Edit3 className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}