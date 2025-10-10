import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Users, UserPlus } from "lucide-react";

interface TeamSelectionProps {
  onCreateTeam: () => void;
  onJoinTeam: () => void;
}

export function TeamSelection({ onCreateTeam, onJoinTeam }: TeamSelectionProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <h1 className="mb-2">Менеджер Задач</h1>
          <p className="text-muted-foreground">
            Выберите роль для работы с задачами
          </p>
        </div>

        <div className="space-y-4">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={onCreateTeam}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Создать команду</CardTitle>
              <CardDescription>
                Создайте новую команду и управляйте задачами сотрудников
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={onCreateTeam}>
                Создать команду
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={onJoinTeam}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Присоединиться к команде</CardTitle>
              <CardDescription>
                Подключитесь к существующей команде как сотрудник
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={onJoinTeam}>
                Присоединиться
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}