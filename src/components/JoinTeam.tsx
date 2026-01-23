import { useState } from "react";
import { db } from "../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface JoinTeamProps {
  onBack: () => void;
  onTeamJoined: (teamCode: string) => void;
}

export function JoinTeam({ onBack, onTeamJoined }: JoinTeamProps) {
  const [teamCode, setTeamCode] = useState("");
  const [error, setError] = useState("");

  async function join(e: React.FormEvent) {
    e.preventDefault();

    const q = query(collection(db, "teams"), where("code", "==", teamCode.trim()));
    const docs = await getDocs(q);

    if (docs.empty) {
      setError("Команда с таким кодом не найдена");
      return;
    }

    const teamDoc = docs.docs[0];

onJoinSuccess({
  id: teamDoc.id,
  ...teamDoc.data(),
});
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Войти в команду</CardTitle>
            <CardDescription>Введите код приглашения</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={join} className="space-y-4">
              <div>
                <Label>Код команды</Label>
                <Input
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <Button type="submit" className="w-full">
                Присоединиться
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
