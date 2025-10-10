import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CheckCircle, XCircle, Clock, Users, Copy, Check } from "lucide-react";

interface JoinRequest {
  id: string;
  teamCode: string;
  employeeName: string;
  employeePhone: string;
  status: 'pending' | 'approved' | 'rejected';
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

interface TeamManagementProps {
  team: Team;
}

export function TeamManagement({ team }: TeamManagementProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [team.code]);

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
    const teamRequests = allRequests
      .filter((req: JoinRequest) => req.teamCode === team.code)
      .map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt)
      }))
      .sort((a: JoinRequest, b: JoinRequest) => b.createdAt.getTime() - a.createdAt.getTime());
    
    setRequests(teamRequests);
  };

  const handleRequest = (requestId: string, status: 'approved' | 'rejected') => {
    const allRequests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
    const updatedRequests = allRequests.map((req: JoinRequest) => 
      req.id === requestId ? { ...req, status } : req
    );
    
    localStorage.setItem('joinRequests', JSON.stringify(updatedRequests));
    loadRequests();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(team.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Team Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Информация о команде
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">{team.name}</h3>
            {team.description && (
              <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Код команды:</span>
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
              {team.code}
            </code>
            <Button size="sm" variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Администратор: {team.adminName}</p>
            <p>Телефон: {team.adminPhone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Requests Management */}
      <Card>
        <CardHeader>
          <CardTitle>Управление заявками</CardTitle>
          <CardDescription>
            Просматривайте и управляйте заявками на присоединение к команде
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Ожидающие ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Одобренные ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Отклоненные ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {pendingRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Нет ожидающих заявок
                </p>
              ) : (
                pendingRequests.map((request) => (
                  <Card key={request.id} className="border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">{request.employeeName}</span>
                            <Badge variant="secondary">Ожидает</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>Телефон: {request.employeePhone}</p>
                            <p>Подано: {request.createdAt.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRequest(request.id, 'approved')}
                            className="h-8"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Одобрить
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRequest(request.id, 'rejected')}
                            className="h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-3">
              {approvedRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Нет одобренных заявок
                </p>
              ) : (
                approvedRequests.map((request) => (
                  <Card key={request.id} className="border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{request.employeeName}</span>
                        <Badge className="bg-green-100 text-green-700">Одобрено</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        <p>Телефон: {request.employeePhone}</p>
                        <p>Одобрено: {request.createdAt.toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-3">
              {rejectedRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Нет отклоненных заявок
                </p>
              ) : (
                rejectedRequests.map((request) => (
                  <Card key={request.id} className="border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{request.employeeName}</span>
                        <Badge variant="destructive">Отклонено</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        <p>Телефон: {request.employeePhone}</p>
                        <p>Отклонено: {request.createdAt.toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}