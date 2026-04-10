'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api';
import type { PaginatedPosts } from '@/types';

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PaginatedPosts>({
    queryKey: ['posts', page],
    queryFn: () => apiFetch(`/posts?page=${page}&limit=10`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Post eliminado');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    },
  });

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        No se pudieron cargar los posts. Intenta de nuevo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          href="/posts/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Nuevo post
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>No hay posts todavía.</p>
          <Link href="/posts/new" className="mt-2 text-sm text-primary underline-offset-4 hover:underline">
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data.map((post) => (
            <div
              key={post.id}
              className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/posts/${post.id}`}
                  className="font-medium hover:underline block truncate"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {post.author.firstName} {post.author.lastName}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Editar
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(post.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            {data.meta.total} posts · Página {data.meta.page} de {data.meta.totalPages}
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
              disabled={page === data.meta.totalPages}
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
