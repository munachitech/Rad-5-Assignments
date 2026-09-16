import {
  User,
  Post,
  Comment,
  CreatePostInput,
  UpdatePostInput,
  PublicUser,
  PostMap,
} from "./models";

import { isUser } from "./validators";

const user: User = {
  id: 1,
  name: "Caris",
  email: "caris@example.com",
  role: "admin",
};

const post: Post = {
  id: 1,
  title: "Learning TypeScript",
  body: "TypeScript makes JavaScript development safer.",
  authorId: user.id,
};

const comment: Comment = {
  id: 1,
  postId: post.id,
  authorName: "Jane",
  content: "Great post!",
};

const createPost: CreatePostInput = {
  title: "Utility Types",
  body: "Learning Omit, Partial and Record.",
  authorId: user.id,
};

const updatePost: UpdatePostInput = {
  title: "Updated Utility Types",
};

const publicUser: PublicUser = {
  id: user.id,
  name: user.name,
  role: user.role,
};

const postMap: PostMap = {
  [post.id]: post,
};

const unknownValue: unknown = user;

if (isUser(unknownValue)) {
  console.log(`Valid user: ${unknownValue.name}`);
}

console.log("Post:", post);
console.log("Comment:", comment);
console.log("Create post:", createPost);
console.log("Update post:", updatePost);
console.log("Public user:", publicUser);
console.log("Post map:", postMap);
function countByRole(users: User[]): Record<User["role"], number> {
  const result: Record<User["role"], number> = {
    admin: 0,
    editor: 0,
    viewer: 0,
  };

  for (const u of users) {
    result[u.role]++;
  }

  return result;
}

const users: User[] = [
  user,
  {
    id: 2,
    name: "Jane",
    email: "jane@example.com",
    role: "editor",
  },
  {
    id: 3,
    name: "John",
    email: "john@example.com",
    role: "viewer",
  },
  {
    id: 4,
    name: "Sarah",
    email: "sarah@example.com",
    role: "admin",
  },
];

console.log("Users by role:", countByRole(users));