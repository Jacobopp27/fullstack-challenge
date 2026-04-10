'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/api';
import type { Post, User } from '@/types';

const postSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  authorUserId: z.coerce.number({ invalid_type_error: 'Elige un autor' }).positive(),
});

export type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
  defaultValues?: Partial<PostFormValues>;
  onSubmit: (values: PostFormValues) => Promise<void>;
  submitLabel?: string;
}

export function PostForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Guardar',
}: PostFormProps) {
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      ...defaultValues,
    },
  });

  // Cargamos solo usuarios guardados porque son los que tienen ID en nuestra DB
  const { data: savedUsers } = useQuery<User[]>({
    queryKey: ['saved-users'],
    queryFn: () => apiFetch('/users/saved'),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título del post" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escribe el contenido del post..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="authorUserId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Autor</FormLabel>
              {!savedUsers || savedUsers.length === 0 ? (
                <p className="text-sm text-amber-600">
                  No hay usuarios guardados. Ve a Usuarios y guarda alguno primero.
                </p>
              ) : (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un autor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {savedUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
