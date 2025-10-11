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
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
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

type AppMode = 'team-selection' | 'create-team' | 'join-team' | 'task-manager';

export default function App() {
  const [mode, setMode] = useState<AppMode>('team-selection');
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'management'>('tasks');

  // Check for existing team and load tasks on mount
  useEffect(() => {
    // Check if user already has a team or is part of one
    const savedTeam = localStorage.getItem('currentTeam');
    if (savedTeam) {
      try {
        const team = JSON.parse(savedTeam);
        setCurrentTeam(team);
        setMode('task-manager');
      } catch (error) {
        console.error('Error loading team:', error);
      }
    }

    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date(),
      ...taskData
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setEditingTask(null);
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.completed));
  };

  const handleTeamCreated = (team: Team) => {
    setCurrentTeam(team);
    localStorage.setItem('currentTeam', JSON.stringify(team));
    setMode('task-manager');
    setActiveTab('management');
  };

  const handleJoinSuccess = () => {
    // Загружаем команду из localStorage если она была установлена
    const savedTeam = localStorage.getItem('currentTeam');
    if (savedTeam) {
      try {
        const team = JSON.parse(savedTeam);
        setCurrentTeam(team);
      } catch (error) {
        console.error('Error loading team:', error);
      }
    }
    
    // Загружаем обновленные задачи
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
    
    setMode('task-manager');
    setActiveTab('tasks');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentTeam');
    setCurrentTeam(null);
    setMode('team-selection');
    setActiveTab('tasks');
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(task => !task.completed).length,
    completed: tasks.filter(task => task.completed).length
  };

  // Render different modes
  if (mode === 'team-selection') {
    return (
      <TeamSelection
        onCreateTeam={() => setMode('create-team')}
        onJoinTeam={() => setMode('join-team')}
      />
    );
  }

  if (mode === 'create-team') {
    return (
      <CreateTeamForm
        onBack={() => setMode('team-selection')}
        onTeamCreated={handleTeamCreated}
      />
    );
  }

  if (mode === 'join-team') {
    return (
      <JoinTeamForm
        onBack={() => setMode('team-selection')}
        onJoinSuccess={handleJoinSuccess}
      />
    );
  }

  // Task Manager Mode
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1>Менеджер Задач</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Выйти
              </Button>
            </div>
          </div>
          
          {currentTeam && (
            <p className="text-center text-muted-foreground">
              Команда: {currentTeam.name}
            </p>
          )}
        </div>

        {/* Admin Features - Show tabs if user is admin */}
        {currentTeam && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tasks' | 'management')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">Задачи</TabsTrigger>
              <TabsTrigger value="management" className="relative">
                <Settings className="h-4 w-4 mr-1" />
                Управление
                <NotificationBadge 
                  teamCode={currentTeam?.code} 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-6 mt-6">
              {/* Stats */}
              <TaskStats tasks={tasks} />

              {/* Filter */}
              <TaskFilter 
                currentFilter={filter}
                onFilterChange={setFilter}
                taskCounts={taskCounts}
              />

              {/* Clear completed button */}
              {taskCounts.completed > 0 && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCompleted}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Очистить {taskCounts.completed} выполненных задач{taskCounts.completed !== 1 ? '' : 'у'}
                  </Button>
                </div>
              )}

              {/* Task List */}
              <div className="space-y-3 pb-24">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {filter === 'active' ? 'Нет активных задач' :
                       filter === 'completed' ? 'Нет выполненных задач' :
                       'Пока нет задач'}
                    </p>
                    {filter === 'all' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Нажмите + чтобы добавить первую задачу
                      </p>
                    )}
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={toggleTaskComplete}
                      onDelete={deleteTask}
                      onEdit={setEditingTask}
                    />
                  ))
                )}
              </div>

              {/* Add Task Form */}
              <AddTaskForm
                onAddTask={addTask}
                editingTask={editingTask}
                onUpdateTask={updateTask}
                onCancelEdit={() => setEditingTask(null)}
              />
            </TabsContent>

            <TabsContent value="management" className="mt-6">
              {currentTeam && <TeamManagement team={currentTeam} />}
            </TabsContent>
          </Tabs>
        )}

        {/* If no current team but in task manager mode */}
        {!currentTeam && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Команда не найдена
            </p>
            <Button onClick={() => setMode('team-selection')}>
              Вернуться к выбору команды
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
