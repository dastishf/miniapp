// src/components/CreateTeam.tsx
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface CreateTeamProps {
  onBack: () => void;
  onTeamCreated: (teamCode: string) => void;
}

export function CreateTeam({ onBack, onTeamCreated }: CreateTeamProps) {
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const createTeam = async () => {
    if (!teamName.trim()) {
      setError("Введите название команды");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const code = generateCode();

      await addDoc(collection(db, "teams"), {
        name: teamName.trim(),
        code,
        createdAt: Date.now(),
      });

      onTeamCreated(code);
    } catch (e) {
      console.error(e);
      setError("Ошибка создания команды");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Создание команды</CardTitle>
          <ThemeToggle />
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Название команды"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            className="w-full"
            onClick={createTeam}
            disabled={loading}
          >
            {loading ? "Создание..." : "Создать команду"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
