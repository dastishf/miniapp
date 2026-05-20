// src/App.tsx
import {
  createTask as fbCreateTask,
  updateTask as fbUpdateTask,
  deleteTask as fbDeleteTask,
  subscribeToTasks,
} from "./services/firebaseTasks";

import { useState, useEffect } from "react";
import { TaskItem } from "./components/TaskItem";
import { AddTaskForm } from "./components/AddTaskForm";
import { TaskStats } from "./components/TaskStats";
import { TaskFilter } from "./components/TaskFilter";
import { TeamSelection } from "./components/TeamSelection";
import { CreateTeamForm } from "./components/CreateTeamForm";
import { JoinTeamForm } from "./components/JoinTeamForm";
import { TeamManagement } from "./components/TeamManagement";
import { ThemeToggle } from "./components/ThemeToggle";
import { NotificationBadge } from "./components/NotificationBadge";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Trash2, Settings } from "lucide-react";

// Расширяем глобальное окно для работы с Google API
declare global {
  interface Window {
    google: any;
  }
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  archived?: boolean;
  assignedTo?: string | null;
  createdBy?: string | null;
  teamId?: string | null;
  dueDate?: string | null; // Добавили поле дедлайна в интерфейс
}

interface TeamMember {
  userId: string;
  role: "admin" | "editor" | "viewer" | string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  adminName: string;
  adminPhone: string;
  code: string;
  createdAt: Date;
  members?: TeamMember[];
}

type AppMode = "team-selection" | "create-team" | "join-team" | "task-manager";

export default function App() {
  const [mode, setMode] = useState<AppMode>("team-selection");
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "archive" | "management">("tasks");

  // Стейт для хранения токена Google авторизации
  const [googleToken, setGoogleToken] = useState<string | null>(() => localStorage.getItem("google_access_token"));

  // ---------- ЛОГИКА GOOGLE CALENDAR ----------
  const handleConnectGoogle = () => {
    const startAuth = () => {
      if (!window.google || !window.google.accounts) {
        alert("Ошибка: API Google недоступно. Отключите AdBlock или обновите страницу.");
        return;
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (response: any) => {
          if (response.access_token) {
            setGoogleToken(response.access_token);
            localStorage.setItem("google_access_token", response.access_token);
            alert("Google Календарь успешно подключен!");
          }
        },
      });
      client.requestAccessToken();
    };

    if (!window.google || !window.google.accounts) {
      console.log("⏳ Загружаем скрипт Google Identity Services...");
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        startAuth();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(startAuth, 100);
      };
      script.onerror = () => alert("Не удалось загрузить скрипт Google.");
      document.head.appendChild(script);
    } else {
      startAuth();
    }
  };

  const addToGoogleCalendar = async (title: string, description: string, dueDate: string, token: string) => {
    const event = {
      summary: title,
      description: description || 'Создано через Atrium Task',
      start: { date: dueDate },
      end: { date: dueDate },
    };

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (response.status === 401) {
        console.warn("Срок действия токена Google истек.");
        setGoogleToken(null);
        localStorage.removeItem("google_access_token");
      } else if (response.ok) {
        console.log("🚀 Задача успешно улетела в Google Календарь!");
      }
    } catch (error) {
      console.error("Ошибка интеграции с Google Календарем:", error);
    }
  };

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    console.log("currentTeam:", currentTeam);
  }, [currentTeam]);

  useEffect(() => {
    const savedTeam = localStorage.getItem("currentTeam");
    if (savedTeam) {
      try {
        const parsedTeam = JSON.parse(savedTeam);
        setCurrentTeam(parsedTeam);
        setMode("task-manager");
        return;
      } catch (e) {
        console.error("Error parsing saved team:", e);
      }
    }

    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        setTasks(
          JSON.parse(savedTasks).map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          }))
        );
      } catch (e) {
        console.error("Error loading local tasks:", e);
      }
    }

    const savedArchive = localStorage.getItem("archivedTasks");
    if (savedArchive) {
      try {
        setArchivedTasks(
          JSON.parse(savedArchive).map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          }))
        );
      } catch (e) {
        console.error("Error loading local archive:", e);
      }
    }
  }, []);

  // ---------- FIREBASE SUBSCRIPTION WHEN TEAM SELECTED ----------
  useEffect(() => {
    if (!currentTeam) return;

    const unsubscribe = subscribeToTasks(currentTeam.id, (firebaseTasks) => {
      const active = firebaseTasks
        .filter((t) => !t.archived)
        .map((t) => ({ ...t, createdAt: new Date(t.createdAt) }));
      const archived = firebaseTasks
        .filter((t) => t.archived)
        .map((t) => ({ ...t, createdAt: new Date(t.createdAt) }));

      setTasks(active);
      setArchivedTasks(archived);
    });

    return () => {
      try {
        unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, [currentTeam]);

  // ---------- LOCAL STORAGE SYNCS (only when NOT in team) ----------
  useEffect(() => {
    if (currentTeam) return;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks, currentTeam]);

  useEffect(() => {
    if (currentTeam) return;
    localStorage.setItem("archivedTasks", JSON.stringify(archivedTasks));
  }, [archivedTasks, currentTeam]);

  // ---------- TASK ACTIONS ----------
  const addTask = async (taskData: Omit<Task, "id" | "completed" | "createdAt">) => {
    if (currentTeam) {
      try {
        await fbCreateTask({
          ...taskData,
          completed: false,
          archived: false,
          teamId: currentTeam.id,
          createdAt: Date.now(),
        });
      } catch (e) {
        console.error("Error creating task in Firebase:", e);
      }
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date(),
        archived: false,
        ...taskData,
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    // Если у созданной задачи есть дедлайн и подключен Google — шлем событие
    if (taskData.dueDate && googleToken) {
      await addToGoogleCalendar(taskData.title, taskData.description || '', taskData.dueDate, googleToken);
    }
  };

  const toggleTaskComplete = async (id: string) => {
    const t = tasks.find((x) => x.id === id) || archivedTasks.find((x) => x.id === id);
    if (!t) return;

    if (currentTeam) {
      try {
        await fbUpdateTask(id, { completed: !t.completed });
      } catch (e) {
        console.error("Error toggling complete in Firebase:", e);
      }
    } else {
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
    }
  };

  const archiveTask = async (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;

    if (currentTeam) {
      try {
        await fbUpdateTask(id, { archived: true });
      } catch (e) {
        console.error("Error archiving task in Firebase:", e);
      }
    } else {
      setTasks((prev) => prev.filter((x) => x.id !== id));
      setArchivedTasks((prev) => [{ ...t, archived: true }, ...prev]);
    }
  };

  const restoreTask = async (id: string) => {
    const t = archivedTasks.find((x) => x.id === id);
    if (!t) return;

    if (currentTeam) {
      try {
        await fbUpdateTask(id, { archived: false });
      } catch (e) {
        console.error("Error restoring task in Firebase:", e);
      }
    } else {
      setArchivedTasks((prev) => prev.filter((x) => x.id !== id));
      setTasks((prev) => [{ ...t, archived: false }, ...prev]);
    }
  };

  const deleteArchivedPermanently = async (id: string) => {
    if (currentTeam) {
      try {
        await fbDeleteTask(id);
      } catch (e) {
        console.error("Error deleting task in Firebase:", e);
      }
    } else {
      setArchivedTasks((prev) => prev.filter((x) => x.id !== id));
    }
  };

  const clearCompleted = async () => {
    if (currentTeam) {
      const toArchive = tasks.filter((t) => t.completed);
      for (const t of toArchive) {
        try {
          await fbUpdateTask(t.id, { archived: true });
        } catch (e) {
          console.error("Error archiving completed task in Firebase:", e);
        }
      }
    } else {
      setTasks((prev) => prev.filter((task) => !task.completed));
    }
  };

  const clearArchive = async () => {
    if (currentTeam) {
      for (const t of archivedTasks) {
        try {
          await fbDeleteTask(t.id);
        } catch (e) {
          console.error("Error deleting archived task from Firebase:", e);
        }
      }
    } else {
      setArchivedTasks([]);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (currentTeam) {
      try {
        await fbUpdateTask(updatedTask.id, {
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          dueDate: updatedTask.dueDate,
        });
      } catch (e) {
        console.error("Error updating task in Firebase:", e);
      }
    } else {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      setEditingTask(null);
    }
  };

  const handleDeletePermanent = async (id: string) => {
    if (currentTeam) {
      try {
        await fbDeleteTask(id);
      } catch (e) {
        console.error("Error deleting task in Firebase:", e);
      }
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setArchivedTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentTeam");
    setCurrentTeam(null);
    setMode("team-selection");
  };

  // ---------- Filtering ----------
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  // ---------- UI MODES ----------
  if (mode === "team-selection") {
    return (
      <TeamSelection
        onCreateTeam={() => setMode("create-team")}
        onJoinTeam={() => setMode("join-team")}
      />
    );
  }

  if (mode === "create-team") {
    return (
      <CreateTeamForm
        onBack={() => setMode("team-selection")}
        onTeamCreated={(team) => {
          setCurrentTeam(team);
          localStorage.setItem("currentTeam", JSON.stringify(team));
          setMode("task-manager");
        }}
      />
    );
  }

  if (mode === "join-team") {
    return (
      <JoinTeamForm
        onBack={() => setMode("team-selection")}
        onJoinSuccess={(teamData) => {
          if (teamData && typeof teamData === 'object' && 'id' in teamData) {
            setCurrentTeam(teamData);
            localStorage.setItem("currentTeam", JSON.stringify(teamData));
            setMode("task-manager");
          } else {
            const saved = localStorage.getItem("currentTeam");
            if (saved) {
              setCurrentTeam(JSON.parse(saved));
              setMode("task-manager");
            }
          }
        }}
      />
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Менеджер Задач</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* НАША НОВАЯ КНОПКА ИНТЕГРАЦИИ GOOGLE */}
            <Button 
              variant={googleToken ? "secondary" : "outline"} 
              onClick={handleConnectGoogle}
              className={googleToken ? "text-green-600 border-green-200 dark:text-green-400 dark:border-green-900" : ""}
            >
              {googleToken ? "📅 Подключен" : "📅 Google"}
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="tasks">Задачи</TabsTrigger>

            <TabsTrigger value="management" className="relative">
              <Settings className="h-4 w-4 mr-1" />
              Управление
              <NotificationBadge
                teamCode={currentTeam?.code}
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              />
            </TabsTrigger>

            <TabsTrigger value="archive">Архив</TabsTrigger>
          </TabsList>

          {/* TASKS */}
          <TabsContent value="tasks" className="mt-6 space-y-6">
            <TaskStats tasks={tasks} />

            <TaskFilter
              currentFilter={filter}
              onFilterChange={setFilter}
              taskCounts={taskCounts}
            />

            {taskCounts.completed > 0 && (
              <Button variant="outline" size="sm" onClick={clearCompleted} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить выполненные
              </Button>
            )}

            <div className="space-y-3 pb-24">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTaskComplete}
                  onDelete={archiveTask}
                  onEdit={setEditingTask}
                />
              ))}
            </div>

            <AddTaskForm
              onAddTask={addTask}
              editingTask={editingTask}
              onUpdateTask={handleUpdateTask}
              onCancelEdit={() => setEditingTask(null)}
            />
          </TabsContent>

          {/* ARCHIVE */}
          <TabsContent value="archive" className="mt-6 space-y-6">
            <h2 className="text-lg font-semibold">Архив задач</h2>

            {archivedTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">Архив пуст</p>
            ) : (
              <div className="space-y-3">
                {archivedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 bg-muted flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => restoreTask(task.id)}>
                        Восстановить
                      </Button>

                      <Button variant="destructive" size="sm" onClick={() => deleteArchivedPermanently(task.id)}>
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {archivedTasks.length > 0 && (
              <Button variant="destructive" className="w-full" onClick={clearArchive}>
                Очистить архив
              </Button>
            )}
          </TabsContent>

          {/* MANAGEMENT */}
          <TabsContent value="management" className="mt-6">
            {currentTeam && <TeamManagement teamCode={currentTeam.code} />}
            {!currentTeam && (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">Вы не в команде — управление недоступно</p>
                <Button onClick={() => setMode("team-selection")}>Присоединиться</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}