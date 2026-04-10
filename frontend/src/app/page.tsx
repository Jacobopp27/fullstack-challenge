import { redirect } from 'next/navigation';

// La raíz del sitio siempre lleva a la lista de usuarios
export default function HomePage() {
  redirect('/users');
}
