'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { use } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api';
import type { ReqResUser, User } from '@/types';

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Datos del usuario desde ReqRes
  const { data: reqResUser, isLoading: loadingReqRes } = useQuery<ReqResUser>({
    queryKey: ['reqres-user', id],
    queryFn: () =>
      apiFetch<{ data: ReqResUser }>(`/users/reqres`).then(
        // Nota: ReqRes no tiene un endpoint para un solo usuario en nuestro proxy,
        // así que cargamos la lista guardada directamente
        () => null as any,
      ),
    enabled: false, // lo manejamos con el endpoint guardado
  });

  // Intentamos ver si ya está guardado en nuestra DB
  const {
    data: savedUser,
    isLoading: loadingSaved,
    refetch,
  } = useQuery<User>({
    queryKey: ['saved-user', id],
    queryFn: () => apiFetch(`/users/saved/${id}`),
    retry: false, // no reintentamos si no está guardado (404)
  });

  async function handleSave() {
    try {
      await apiFetch(`/users/import/${id}`, { method: 'POST' });
      toast.success('Usuario guardado correctamente');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    }
  }

  const isLoading = loadingSaved;
  const user = savedUser;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/users" className="text-sm text-gray-500 hover:text-gray-900">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Detalle de usuario</h1>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
      ) : user ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <img
                src={user.avatar}
                alt={user.firstName}
                className="w-16 h-16 rounded-full object-cover bg-gray-100"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`;
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </h2>
                  <Badge variant="secondary">Guardado</Badge>
                  <Badge>{user.role}</Badge>
                </div>
                <p className="text-gray-500 mt-1">{user.email}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Guardado el {new Date(user.savedAt).toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-gray-500">Este usuario aún no está guardado localmente</p>
            <Button onClick={handleSave}>Guardar usuario</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
