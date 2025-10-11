import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface Team {
  id: string;
  name: string;
  description: string;
  adminName: string;
  adminPhone: string;
  code: string;
  createdAt: Date;
}

interface CreateTeamFormProps {
  onBack: () => void;
  onTeamCreated: (team: Team) => void;
}

export function CreateTeamForm({ onBack, onTeamCreated }: CreateTeamFormProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [createdTeam, setCreatedTeam] = useState<Team | null>(null);
  const [copied, setCopied] = useState(false);

  const generateTeamCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim() || !adminName.trim() || !adminPhone.trim()) return;

    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: teamName.trim(),
      description: description.trim(),
      adminName: adminName.trim(),
      adminPhone: adminPhone.trim(),
      code: generateTeamCode(),
      createdAt: new Date()
    };

    // Сохраняем команду в localStorage
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    teams.push(newTeam);
    localStorage.setItem('teams', JSON.stringify(teams));

    setCreatedTeam(newTeam);
    setStep('success');
    onTeamCreated(newTeam);
  };

  const copyToClipboard = () => {
    if (createdTeam) {
      navigator.clipboard.writeText(createdTeam.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (step === 'success' && createdTeam) {
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
              <CardTitle className="text-green-600">Команда создана!</CardTitle>
              <CardDescription>
                Поделитесь кодом команды с сотрудниками
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Код команды:</p>
                <div className="flex items-center gap-2">
                  <code className="text-2xl font-mono bg-background px-3 py-2 rounded border flex-1">
                    {createdTeam.code}
                  </code>
                  <Button size="icon" variant="outline" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="text-left space-y-2">
                <p><strong>Название:</strong> {createdTeam.name}</p>
                <p><strong>Администратор:</strong> {createdTeam.adminName}</p>
                <p><strong>Телефон:</strong> {createdTeam.adminPhone}</p>
              </div>

              <Button className="w-full" onClick={() => window.location.reload()}>
                Перейти к управлению задачами
              </Button>
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
            <CardTitle>Создание команды</CardTitle>
            <CardDescription>
              Заполните информацию для создания новой команды
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Название команды</Label>
                <Input
                  id="teamName"
                  placeholder="Введите название команды"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание (необязательно)</Label>
                <Textarea
                  id="description"
                  placeholder="Описание команды или проекта"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminName">Ваше ФИО</Label>
                <Input
                  id="adminName"
                  placeholder="Иванов Иван Иванович"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPhone">Номер телефона</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Создать команду
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
