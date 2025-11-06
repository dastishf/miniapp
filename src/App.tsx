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

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  archived?: boolean;
}

interface Team {
  id: string;
  name: string;
  description: string;
  adminName: string;
  adminPhone: string;
  code: string;
  createdAt: Date;
}

type AppMode = "team-selection" | "create-team" | "join-team" | "task-manager";

export default function App() {
  const [mode, setMode] = useState<AppMode>("team-selection");
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);

  const [filter, setFilter] =
    useState<"all" | "active" | "completed">("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] =
    useState<"tasks" | "archive" | "management">("tasks");

  // ✅ Load everything at start
  useEffect(() => {
    // Load team
    const savedTeam = localStorage.getItem("currentTeam");
    if (savedTeam) {
      try {
        setCurrentTeam(JSON.parse(savedTeam));
        setMode("task-manager");
      } catch {}
    }

    // Load tasks
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        setTasks(
          JSON.parse(savedTasks).map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          }))
        );
      } catch {}
    }

    // Load archive
    const savedArchive = localStorage.getItem("archivedTasks");
    if (savedArchive) {
      try {
        setArchivedTasks(
          JSON.parse(savedArchive).map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          }))
        );
      } catch {}
    }
  }, []);

  // ✅ Save tasks
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // ✅ Save archive
  useEffect(() => {
    localStorage.setItem("archivedTasks", JSON.stringify(archivedTasks));
  }, [archivedTasks]);

  // ✅ Add task
  const addTask = (
    taskData: Omit<Task, "id" | "completed" | "createdAt">
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date(),
      archived: false,
      ...taskData,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // ✅ Complete toggle
  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // ✅ Archive instead of delete
  const deleteTask = (id: string) => {
    const taskToArchive = tasks.find((t) => t.id === id);
    if (!taskToArchive) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));
    setArchivedTasks((prev) => [
      { ...taskToArchive, archived: true },
      ...prev,
    ]);
  };

  // ✅ Restore archived task
  const restoreTask = (id: string) => {
    const taskToRestore = archivedTasks.find((t) => t.id === id);
    if (!taskToRestore) return;

    setArchivedTasks((prev) => prev.filter((t) => t.id !== id));
    setTasks((prev) => [
      { ...taskToRestore, archived: false },
      ...prev,
    ]);
  };

  // ✅ Clear completed tasks
  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  };

  // ✅ Clear entire archive
  const clearArchive = () => {
    setArchivedTasks([]);
  };

  // ✅ Restore task editing
  const updateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setEditingTask(null);
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("currentTeam");
    setCurrentTeam(null);
    setMode("team-selection");
  };

  // ✅ Filtering
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

  // ✅ UI MODES

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
        onJoinSuccess={() => setMode("task-manager")}
      />
    );
  }

  // ✅ MAIN TASK MANAGER SCREEN
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1>Менеджер Задач</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
        >
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

          {/* ✅ ЗАДАЧИ */}
          <TabsContent value="tasks" className="mt-6 space-y-6">
            <TaskStats tasks={tasks} />

            <TaskFilter
              currentFilter={filter}
              onFilterChange={setFilter}
              taskCounts={taskCounts}
            />

            {taskCounts.completed > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompleted}
                className="w-full"
              >
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
                  onDelete={deleteTask}
                  onEdit={setEditingTask}
                />
              ))}
            </div>

            <AddTaskForm
              onAddTask={addTask}
              editingTask={editingTask}
              onUpdateTask={updateTask}
              onCancelEdit={() => setEditingTask(null)}
            />
          </TabsContent>

          {/* ✅ АРХИВ */}
          <TabsContent value="archive" className="mt-6 space-y-6">
            <h2 className="text-lg font-semibold">Архив задач</h2>

            {archivedTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                Архив пуст
              </p>
            ) : (
              <div className="space-y-3">
                {archivedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 bg-muted flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreTask(task.id)}
                      >
                        Восстановить
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setArchivedTasks((prev) =>
                            prev.filter((t) => t.id !== task.id)
                          )
                        }
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {archivedTasks.length > 0 && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={clearArchive}
              >
                Очистить архив
              </Button>
            )}
          </TabsContent>

          {/* ✅ УПРАВЛЕНИЕ */}
          <TabsContent value="management" className="mt-6">
            {currentTeam && <TeamManagement team={currentTeam} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}