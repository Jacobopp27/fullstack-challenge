export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: Role;
  savedAt: string;
}

export interface ReqResUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface ReqResListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: ReqResUser[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorUserId: number;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPosts {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
