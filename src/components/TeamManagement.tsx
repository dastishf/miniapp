import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, Clock, Copy, Check } from "lucide-react";

interface JoinRequest {
  id: string;
  teamCode: string;
  employeeName: string;
  employeePhone: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

interface TeamManagementProps {
  teamCode: string;
}

export function TeamManagement({ teamCode }: TeamManagementProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [teamCode]);

  const loadRequests = () => {
    const all = JSON.parse(localStorage.getItem("joinRequests") || "[]");

    const filtered = all
      .filter((r: JoinRequest) => r.teamCode === teamCode)
      .sort((a: JoinRequest, b: JoinRequest) => b.createdAt - a.createdAt);

    setRequests(filtered);
  };

  const handleRequest = (id: string, status: "approved" | "rejected") => {
    const all = JSON.parse(localStorage.getItem("joinRequests") || "[]");

    const updated = all.map((r: JoinRequest) =>
      r.id === id ? { ...r, status } : r
    );

    localStorage.setItem("joinRequests", JSON.stringify(updated));
    loadRequests();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const pending = requests.filter(r => r.status === "pending");
  const approved = requests.filter(r => r.status === "approved");
  const rejected = requests.filter(r => r.status === "rejected");

  return (
    <div className="space-y-6">
      {/* TEAM INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Команда</CardTitle>
          <CardDescription>Код команды</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <code className="text-xl font-mono bg-muted px-3 py-2 rounded">
            {teamCode}
          </code>
          <Button size="icon" variant="outline" onClick={copyCode}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      {/* REQUESTS */}
      <Card>
        <CardHeader>
          <CardTitle>Заявки на вступление</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="pending">Ожидают ({pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Приняты ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Отклонены ({rejected.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pending.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  Нет заявок
                </p>
              ) : (
                pending.map(r => (
                  <Card key={r.id} className="mb-3">
                    <CardContent className="p-4 flex justify-between">
                      <div>
                        <p className="font-medium">{r.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{r.employeePhone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleRequest(r.id, "approved")}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Принять
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRequest(r.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="approved">
              {approved.map(r => (
                <Badge key={r.id} className="block mb-2">
                  {r.employeeName}
                </Badge>
              ))}
            </TabsContent>

            <TabsContent value="rejected">
              {rejected.map(r => (
                <Badge key={r.id} variant="destructive" className="block mb-2">
                  {r.employeeName}
                </Badge>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
