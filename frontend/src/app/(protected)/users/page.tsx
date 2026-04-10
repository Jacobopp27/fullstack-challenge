'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api';
import type { ReqResListResponse, ReqResUser, User } from '@/types';
import Link from 'next/link';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  // Usuarios de ReqRes (paginados desde el backend)
  const { data, isLoading, isError } = useQuery<ReqResListResponse>({
    queryKey: ['reqres-users', page],
    queryFn: () => apiFetch(`/users/reqres?page=${page}`),
  });

  // Usuarios guardados en nuestra DB para saber cuáles ya están importados
  const { data: savedUsers, refetch: refetchSaved } = useQuery<User[]>({
    queryKey: ['saved-users'],
    queryFn: () => apiFetch('/users/saved'),
  });

  const savedIds = new Set(savedUsers?.map((u) => u.id) ?? []);

  // Filtra por nombre o email en el cliente
  const filtered = (data?.data ?? []).filter((u) => {
    const term = search.toLowerCase();
    return (
      u.first_name.toLowerCase().includes(term) ||
      u.last_name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  async function handleSave(user: ReqResUser) {
    setSavingId(user.id);
    try {
      await apiFetch(`/users/import/${user.id}`, { method: 'POST' });
      toast.success(`${user.first_name} guardado correctamente`);
      refetchSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar usuario');
    } finally {
      setSavingId(null);
    }
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        No se pudo cargar la lista de usuarios. Intenta de nuevo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Input
          placeholder="Buscar por nombre o email..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No se encontraron usuarios
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user) => {
            const isSaved = savedIds.has(user.id);
            return (
              <div
                key={user.id}
                className="bg-white border rounded-lg p-4 flex items-center gap-4"
              >
                <img
                  src={user.avatar}
                  alt={user.first_name}
                  className="w-12 h-12 rounded-full object-cover bg-gray-100"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/users/${user.id}`}
                    className="font-medium hover:underline block truncate"
                  >
                    {user.first_name} {user.last_name}
                  </Link>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                {isSaved ? (
                  <Badge variant="secondary">Guardado</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={savingId === user.id}
                    onClick={() => handleSave(user)}
                  >
                    {savingId === user.id ? 'Guardando...' : 'Guardar'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Controles de paginación */}
      {data && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            Página {data.page} de {data.total_pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
