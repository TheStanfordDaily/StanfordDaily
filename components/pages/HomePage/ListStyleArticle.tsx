import React from "react";
import { Article, ArticleHeader } from "components/Article";
import AuthorAndDateView from "components/AuthorAndDateView";
import { ArticleProps } from "./ArticleProps";
import { ArticleTitleWithLink } from "./ArticleTitleWithLink";

export const ListStyleArticle: React.ElementType = ({
  post,
  displayAuthor = true,
  titleStyle,
  authorStyle,
}: ArticleProps) => {
  return (
    <Article post={post}>
      {displayAuthor && <AuthorAndDateView post={post} style={authorStyle} />}
      <ArticleHeader>
        <ArticleTitleWithLink post={post} marginBottomMore style={titleStyle} />
      </ArticleHeader>
    </Article>
  );
};
