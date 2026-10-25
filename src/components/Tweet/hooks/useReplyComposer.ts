import { useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { api } from '../../../services/api';
import type { IComment, ITweetData } from '../types';

interface Options {
  tweetId: ITweetData['id'];
  /** Chamado após o POST dar certo (ex.: atualizar contagem e recarregar comentários). */
  onSubmitted: (parentId?: IComment['id']) => Promise<void> | void;
}

/** Estado do modal de resposta (ao tweet ou a um comentário) e envio do formulário. */
export function useReplyComposer({ tweetId, onSubmitted }: Options) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<IComment | null>(null);

  const openForTweet = (e: MouseEvent) => {
    e.stopPropagation();
    setReplyingTo(null);
    setIsOpen(true);
  };

  const openForComment = (e: MouseEvent, comment: IComment) => {
    e.stopPropagation();
    setReplyingTo(comment);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const parentId = replyingTo?.id;

      await api.post(`tweets/${tweetId}/comment/`, {
        content: text.trim(),
        parent: parentId || null,
      });

      setText('');
      setReplyingTo(null);
      setIsOpen(false);

      await onSubmitted(parentId);
    } catch (error) {
      console.error('Erro ao comentar:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isOpen,
    text,
    setText,
    loading,
    replyingTo,
    openForTweet,
    openForComment,
    close,
    submit,
  };
}
