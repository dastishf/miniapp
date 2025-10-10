import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface JoinRequest {
  id: string;
  teamCode: string;
  employeeName: string;
  employeePhone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

interface JoinTeamFormProps {
  onBack: () => void;
  onJoinSuccess: () => void;
}

export function JoinTeamForm({ onBack, onJoinSuccess }: JoinTeamFormProps) {
  const [step, setStep] = useState<'form' | 'pending'>('form');
  const [teamCode, setTeamCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [request, setRequest] = useState<JoinRequest | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamCode.trim() || !employeeName.trim() || !employeePhone.trim()) return;

    const upperCaseCode = teamCode.trim().toUpperCase();

    // Специальный демо-код для разработчиков
    if (upperCaseCode === 'DEMO24') {
      // Создаем демо-команду
      const demoTeam = {
        id: 'demo-team-id',
        name: 'Демо Команда',
        description: 'Команда для демонстрации функционала приложения',
        adminName: 'Администратор Демо',
        adminPhone: '+7 (999) 000-00-00',
        code: 'DEMO24',
        createdAt: new Date()
      };

      // Сохраняем демо-команду
      let teams = JSON.parse(localStorage.getItem('teams') || '[]');
      const existingTeamIndex = teams.findIndex((t: any) => t.code === 'DEMO24');
      if (existingTeamIndex === -1) {
        teams.push(demoTeam);
        localStorage.setItem('teams', JSON.stringify(teams));
      }

      // Создаем демонстрационные задачи
      const demoTasks = [
        {
          id: 'demo-task-1',
          title: 'Изучить интерфейс приложения',
          description: 'Ознакомиться с основными функциями менеджера задач',
          completed: true,
          priority: 'high',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 дня назад
        },
        {
          id: 'demo-task-2',
          title: 'Протестировать добавление новых задач',
          description: 'Попробовать создать несколько задач с разными приоритетами',
          completed: false,
          priority: 'medium',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 день назад
        },
        {
          id: 'demo-task-3',
          title: 'Проверить систему фильтрации',
          description: 'Переключиться между разными видами задач: все, активные, выполненные',
          completed: false,
          priority: 'low',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 часа назад
        }
      ];

      // Сохраняем демо-задачи
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const hasExistingDemoTasks = existingTasks.some((task: any) => task.id.startsWith('demo-task-'));
      
      if (!hasExistingDemoTasks) {
        const allTasks = [...demoTasks, ...existingTasks];
        localStorage.setItem('tasks', JSON.stringify(allTasks));
      }

      // Автоматически сохраняем команду как текущую и присоединяем пользователя
      localStorage.setItem('currentTeam', JSON.stringify(demoTeam));
      
      // Сразу переходим к менеджеру задач без подтверждений
      onJoinSuccess();
      return;
    }

    // Проверяем, существует ли команда с таким кодом
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const team = teams.find((t: any) => t.code === upperCaseCode);
    
    if (!team) {
      alert('Команда с таким кодом не найдена');
      return;
    }

    const newRequest: JoinRequest = {
      id: crypto.randomUUID(),
      teamCode: upperCaseCode,
      employeeName: employeeName.trim(),
      employeePhone: employeePhone.trim(),
      status: 'pending',
      createdAt: new Date()
    };

    // Сохраняем заявку в localStorage
    const requests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
    requests.push(newRequest);
    localStorage.setItem('joinRequests', JSON.stringify(requests));

    setRequest(newRequest);
    setStep('pending');
  };

  const checkRequestStatus = () => {
    if (!request) return;
    
    const requests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
    const updatedRequest = requests.find((r: JoinRequest) => r.id === request.id);
    
    if (updatedRequest && updatedRequest.status !== request.status) {
      setRequest(updatedRequest);
      
      if (updatedRequest.status === 'approved') {
        setTimeout(() => {
          onJoinSuccess();
        }, 2000);
      }
    }
  };

  if (step === 'pending' && request) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                {request.status === 'pending' && <Clock className="h-8 w-8 text-orange-500" />}
                {request.status === 'approved' && <CheckCircle className="h-8 w-8 text-green-500" />}
                {request.status === 'rejected' && <XCircle className="h-8 w-8 text-red-500" />}
              </div>
              
              <CardTitle>
                {request.status === 'pending' && 'Заявка отправлена'}
                {request.status === 'approved' && 'Заявка одобрена!'}
                {request.status === 'rejected' && 'Заявка отклонена'}
              </CardTitle>
              
              <CardDescription>
                {request.status === 'pending' && 'Ожидайте одобрения администратора команды'}
                {request.status === 'approved' && 'Добро пожаловать в команду!'}
                {request.status === 'rejected' && 'Администратор отклонил вашу заявку'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-left space-y-2 p-4 bg-muted rounded-lg">
                <p><strong>Код команды:</strong> {request.teamCode}</p>
                <p><strong>Ваше ФИО:</strong> {request.employeeName}</p>
                <p><strong>Телефон:</strong> {request.employeePhone}</p>
                <p><strong>Статус:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    request.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    request.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {request.status === 'pending' ? 'Ожидает' : 
                     request.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                  </span>
                </p>
              </div>

              {request.status === 'pending' && (
                <Button onClick={checkRequestStatus} variant="outline" className="w-full">
                  Проверить статус
                </Button>
              )}

              {request.status === 'approved' && (
                <Button onClick={onJoinSuccess} className="w-full">
                  Перейти к задачам
                </Button>
              )}

              {request.status === 'rejected' && (
                <Button onClick={() => {
                  setStep('form');
                  setRequest(null);
                  setTeamCode('');
                  setEmployeeName('');
                  setEmployeePhone('');
                }} variant="outline" className="w-full">
                  Подать новую заявку
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Присоединение к команде</CardTitle>
            <CardDescription>
              Введите код команды и ваши данные для подачи заявки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamCode">Код команды</Label>
                <Input
                  id="teamCode"
                  placeholder="Введите код команды"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeName">Ваше ФИО</Label>
                <Input
                  id="employeeName"
                  placeholder="Иванов Иван Иванович"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeePhone">Номер телефона</Label>
                <Input
                  id="employeePhone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={employeePhone}
                  onChange={(e) => setEmployeePhone(e.target.value)}
                  required
                />
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  После отправки заявки администратор команды получит ваши данные и сможет одобрить или отклонить запрос на присоединение.
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Для тестирования:</strong> Используйте код <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">DEMO24</code> для мгновенного доступа к демо-команде с примерами задач.
                </p>
              </div>

              <Button type="submit" className="w-full">
                Отправить заявку
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}