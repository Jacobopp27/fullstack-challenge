'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PostForm, PostFormValues } from '@/components/posts/post-form';
import { apiFetch } from '@/lib/api';
import type { Post } from '@/types';

export default function EditPostPage({
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

  async function handleSubmit(values: PostFormValues) {
    await apiFetch(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(values),
    });
    toast.success('Post actualizado');
    queryClient.invalidateQueries({ queryKey: ['post', id] });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    router.push(`/posts/${id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/posts/${id}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Editar post</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar post</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-32" />
              <Skeleton className="h-10" />
            </div>
          ) : post ? (
            <PostForm
              defaultValues={{
                title: post.title,
                content: post.content,
                authorUserId: post.authorUserId,
              }}
              onSubmit={handleSubmit}
              submitLabel="Actualizar post"
            />
          ) : (
            <p className="text-gray-500">Post no encontrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
