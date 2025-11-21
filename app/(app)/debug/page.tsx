"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCouple } from "@/hooks/useCouple";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const { user } = useAuth();
  const { couple, profile, partner, loading } = useCouple();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Debug Info</h1>

      <Card>
        <CardHeader>
          <CardTitle>Auth User</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded text-xs overflow-auto">
            {JSON.stringify({
              id: user?.id,
              email: user?.email,
              loading: loading,
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded text-xs overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Couple</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded text-xs overflow-auto">
            {JSON.stringify(couple, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partner Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded text-xs overflow-auto">
            {JSON.stringify(partner, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
