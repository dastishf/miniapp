// src/components/CreateTeamForm.tsx
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ArrowLeft } from "lucide-react";
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
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateTeamCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim() || !adminName.trim() || !adminPhone.trim()) {
      setError("Заполните обязательные поля");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const code = generateTeamCode();

      const docRef = await addDoc(collection(db, "teams"), {
        name: teamName.trim(),
        description: description.trim(),
        adminName: adminName.trim(),
        adminPhone: adminPhone.trim(),
        code,
        createdAt: Date.now(),
      });

      const team: Team = {
        id: docRef.id,
        name: teamName.trim(),
        description: description.trim(),
        adminName: adminName.trim(),
        adminPhone: adminPhone.trim(),
        code,
        createdAt: new Date(),
      };

      // 🔥 СРАЗУ ПЕРЕХОД В ЗАДАЧИ
      onTeamCreated(team);
    } catch (e) {
      console.error(e);
      setError("Ошибка при создании команды");
    } finally {
      setLoading(false);
    }
  };

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
              Команда будет создана, и вы сразу перейдёте к задачам
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Название команды</Label>
                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Описание (необязательно)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Ваше ФИО</Label>
                <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Создание..." : "Создать команду"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}