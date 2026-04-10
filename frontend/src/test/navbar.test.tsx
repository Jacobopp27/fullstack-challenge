import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '@/components/layout/navbar';

// next/navigation no funciona en tests, lo simulamos
vi.mock('next/navigation', () => ({
  usePathname: () => '/users',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}));

describe('Navbar', () => {
  it('muestra los links de navegación', () => {
    render(<Navbar />);

    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('resalta el link de la página activa', () => {
    render(<Navbar />);

    // /users está activo según el mock de usePathname
    const usuariosLink = screen.getByText('Usuarios');
    expect(usuariosLink).toHaveClass('font-medium');
  });

  it('muestra el botón de salir', () => {
    render(<Navbar />);
    expect(screen.getByRole('button', { name: /salir/i })).toBeInTheDocument();
  });
});
