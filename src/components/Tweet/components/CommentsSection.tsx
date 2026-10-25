import type { RefObject } from 'react';
import {
  CommentListEmpty,
  CommentListLoading,
  CommentScrollArea,
  CommentSection,
  CommentsList,
  LoadMoreButton,
} from '../styles';
import type { IComment } from '../types';
import CommentTree from './CommentTree';
import type { CommentTreeSharedProps } from './CommentTree';

interface CommentsSectionProps {
  containerRef: RefObject<HTMLDivElement | null>;
  comments: IComment[];
  loading: boolean;
  visibleCount: number;
  onLoadMore: () => void;
  treeProps: CommentTreeSharedProps;
}

/** Área expansível com a lista de comentários, estados de loading/vazio e "Ver mais". */
const CommentsSection = ({
  containerRef,
  comments,
  loading,
  visibleCount,
  onLoadMore,
  treeProps,
}: CommentsSectionProps) => (
  <div ref={containerRef} onClick={(e) => e.stopPropagation()}>
    <CommentScrollArea>
      <CommentSection>
        <CommentsList>
          {loading ? (
            <CommentListLoading>Carregando comentários...</CommentListLoading>
          ) : comments.length > 0 ? (
            <>
              <CommentTree
                comments={comments.slice(0, visibleCount)}
                {...treeProps}
              />
              {comments.length > visibleCount && (
                <LoadMoreButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadMore();
                  }}
                >
                  Ver mais comentários...
                </LoadMoreButton>
              )}
            </>
          ) : (
            <CommentListEmpty>
              Nenhum comentário ainda. Seja o primeiro!
            </CommentListEmpty>
          )}
        </CommentsList>
      </CommentSection>
    </CommentScrollArea>
  </div>
);

export default CommentsSection;
