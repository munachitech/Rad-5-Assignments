export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

export interface Post {
  id: number;
  title: string;
  body: string;
  authorId: number;
  publishedAt?: Date;
}

export interface Comment {
  id: number;
  postId: number;
  authorName: string;
  content: string;
}

export type CreatePostInput = Omit<Post, "id" | "publishedAt">;

export type UpdatePostInput = Partial<Omit<Post, "id">>;

export type PublicUser = Omit<User, "email">;

export type PostMap = Record<number, Post>;