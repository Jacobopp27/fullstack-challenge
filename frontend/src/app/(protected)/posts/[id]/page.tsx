'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api';
import type { Post } from '@/types';

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: () => apiFetch(`/posts/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Post eliminado');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      router.push('/posts');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Post no encontrado</p>
        <Link href="/posts" className="text-sm text-primary underline-offset-4 hover:underline">
          Volver a posts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/posts" className="text-sm text-gray-500 hover:text-gray-900">
          ← Volver
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h1 className="text-2xl font-bold">{post.title}</h1>

          <div className="flex items-center gap-2">
            <img
              src={post.author.avatar}
              alt={post.author.firstName}
              className="w-6 h-6 rounded-full object-cover bg-gray-100"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=random&size=32`;
              }}
            />
            <Badge variant="outline">
              {post.author.firstName} {post.author.lastName}
            </Badge>
            <span className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString('es-CO')}
            </span>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

          {post.updatedAt !== post.createdAt && (
            <p className="text-xs text-gray-400">
              Actualizado el {new Date(post.updatedAt).toLocaleDateString('es-CO')}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Link
              href={`/posts/${id}/edit`}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              Editar
            </Link>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
