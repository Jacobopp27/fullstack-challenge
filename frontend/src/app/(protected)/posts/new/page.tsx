'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostForm, PostFormValues } from '@/components/posts/post-form';
import { apiFetch } from '@/lib/api';

export default function NewPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleSubmit(values: PostFormValues) {
    await apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    toast.success('Post creado correctamente');
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    router.push('/posts');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/posts" className="text-sm text-gray-500 hover:text-gray-900">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Nuevo post</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crear post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm onSubmit={handleSubmit} submitLabel="Crear post" />
        </CardContent>
      </Card>
    </div>
  );
}
