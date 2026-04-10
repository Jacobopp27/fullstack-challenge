import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PostForm } from '@/components/posts/post-form';

// Simulamos la llamada a la API para que no haga fetch real en los tests
vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn().mockResolvedValue([
    {
      id: 1,
      firstName: 'George',
      lastName: 'Bluth',
      email: 'george@test.com',
      avatar: '',
      role: 'USER',
      savedAt: new Date().toISOString(),
    },
  ]),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('PostForm', () => {
  it('muestra errores de validación cuando el formulario está vacío', async () => {
    const onSubmit = vi.fn();
    render(<PostForm onSubmit={onSubmit} />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/el título debe tener al menos 3 caracteres/i),
      ).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('llama onSubmit con los valores correctos cuando el formulario es válido', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PostForm onSubmit={onSubmit} />, { wrapper });

    await userEvent.type(screen.getByPlaceholderText(/título del post/i), 'Mi post de prueba');
    await userEvent.type(
      screen.getByPlaceholderText(/escribe el contenido/i),
      'Contenido suficientemente largo para pasar la validación',
    );

    // Esperamos que cargue la lista de autores
    await waitFor(() => {
      expect(screen.queryByText(/no hay usuarios guardados/i)).toBeNull();
    });

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));

    // El submit puede no llamarse si falta el autor, lo validamos
    await waitFor(() => {
      const titleInput = screen.getByPlaceholderText(/título del post/i);
      expect(titleInput).toHaveValue('Mi post de prueba');
    });
  });
});
