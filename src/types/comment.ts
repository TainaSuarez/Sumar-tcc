export interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string | null;
  organizationName: string | null;
  avatar: string | null;
  userType: 'INDIVIDUAL' | 'ORGANIZATION';
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  author: CommentAuthor;
  replies?: Comment[];
  repliesCount: number;
  hasMoreReplies?: boolean;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateCommentInput {
  content: string;
  parentId?: string;
}

export interface RepliesResponse {
  replies: Comment[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
