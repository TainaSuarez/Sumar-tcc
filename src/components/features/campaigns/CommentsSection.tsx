'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  MessageCircle, 
  Reply, 
  Send, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Building2,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Comment, CommentsResponse, CreateCommentInput } from '@/types/comment';

interface CommentsSectionProps {
  campaignId: string;
}

interface CommentCardProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<void>;
  isReplying: boolean;
  campaignId: string;
}

function CommentCard({ comment, onReply, isReplying, campaignId }: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showMoreReplies, setShowMoreReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [additionalReplies, setAdditionalReplies] = useState<Comment[]>([]);
  const { data: session } = useSession();

  const getAuthorName = (comment: Comment) => {
    if (comment.author.userType === 'ORGANIZATION' && comment.author.organizationName) {
      return comment.author.organizationName;
    }
    return `${comment.author.firstName} ${comment.author.lastName || ''}`.trim();
  };

  const getAuthorInitials = (comment: Comment) => {
    const name = getAuthorName(comment);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error al enviar respuesta:', error);
    }
  };

  const loadMoreReplies = async () => {
    try {
      setLoadingReplies(true);
      const response = await fetch(
        `/api/campaigns/${campaignId}/comments/${comment.id}/replies?page=2&limit=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAdditionalReplies(data.replies);
        setShowMoreReplies(true);
      }
    } catch (error) {
      console.error('Error al cargar más respuestas:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author.avatar || undefined} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700">
              {getAuthorInitials(comment)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {getAuthorName(comment)}
              </h4>
              
              {comment.author.userType === 'ORGANIZATION' ? (
                <Building2 className="h-4 w-4 text-blue-500" />
              ) : (
                <User className="h-4 w-4 text-gray-500" />
              )}
              
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
          {comment.content}
        </p>

        {/* Acciones del comentario */}
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {session && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 hover:text-emerald-600 transition-colors"
            >
              <Reply className="h-3 w-3" />
              <span>Responder</span>
            </button>
          )}
          
          {comment.repliesCount > 0 && (
            <span className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{comment.repliesCount} respuesta{comment.repliesCount !== 1 ? 's' : ''}</span>
            </span>
          )}
        </div>

        {/* Formulario de respuesta */}
        {showReplyForm && session && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {session.user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Escribe tu respuesta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={!replyContent.trim() || isReplying}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isReplying ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Responder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Respuestas existentes */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.author.avatar || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getAuthorInitials(reply)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="text-xs font-medium text-gray-900">
                      {getAuthorName(reply)}
                    </h5>
                    {reply.author.userType === 'ORGANIZATION' ? (
                      <Building2 className="h-3 w-3 text-blue-500" />
                    ) : (
                      <User className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(reply.createdAt), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Respuestas adicionales cargadas */}
            {showMoreReplies && additionalReplies.map((reply) => (
              <div key={reply.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.author.avatar || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getAuthorInitials(reply)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="text-xs font-medium text-gray-900">
                      {getAuthorName(reply)}
                    </h5>
                    {reply.author.userType === 'ORGANIZATION' ? (
                      <Building2 className="h-3 w-3 text-blue-500" />
                    ) : (
                      <User className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(reply.createdAt), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Botón para cargar más respuestas */}
            {comment.hasMoreReplies && !showMoreReplies && (
              <button
                onClick={loadMoreReplies}
                disabled={loadingReplies}
                className="flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {loadingReplies ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                <span>
                  {loadingReplies ? 'Cargando...' : `Ver más respuestas (${comment.repliesCount - comment.replies.length})`}
                </span>
              </button>
            )}

            {/* Botón para ocultar respuestas adicionales */}
            {showMoreReplies && (
              <button
                onClick={() => setShowMoreReplies(false)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronUp className="h-3 w-3" />
                <span>Ocultar respuestas adicionales</span>
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CommentsSection({ campaignId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [pagination, setPagination] = useState<CommentsResponse['pagination'] | null>(null);
  const { data: session } = useSession();

  const loadComments = async (page = 1) => {
    try {
      setLoading(page === 1);
      const response = await fetch(`/api/campaigns/${campaignId}/comments?page=${page}&limit=10`);
      
      if (response.ok) {
        const data: CommentsResponse = await response.json();
        if (page === 1) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [campaignId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !session) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/campaigns/${campaignId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        // Agregar el nuevo comentario al inicio de la lista
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error al enviar comentario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!session) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/campaigns/${campaignId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, parentId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Actualizar el comentario padre con la nueva respuesta
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data.comment],
              repliesCount: comment.repliesCount + 1,
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error al enviar respuesta:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const loadMoreComments = () => {
    if (pagination?.hasNext) {
      loadComments(pagination.page + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <MessageCircle className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comentarios {pagination && `(${pagination.totalCount})`}
        </h3>
      </div>

      {/* Formulario para nuevo comentario */}
      {session ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {session.user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Comentar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">
              Inicia sesión para participar en la conversación
            </p>
            <Button variant="outline" asChild>
              <a href="/auth/signin">Iniciar Sesión</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de comentarios */}
      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : comments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Sé el primero en comentar esta campaña
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              isReplying={submitting}
              campaignId={campaignId}
            />
          ))}

          {/* Botón para cargar más comentarios */}
          {pagination?.hasNext && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={loadMoreComments}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                Cargar más comentarios
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
