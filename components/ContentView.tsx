import React from "react";
import { Global } from "@emotion/core";
import RView from "emotion-native-media-query";
import { Post } from "helpers/wpapi";
import { BREAKPOINTS, FONTS } from "helpers/constants";
import { SectionStyle } from "components/Section";
import { Article, ArticleHeader } from "components/Article";
import LoadingView from "components/Loading";
import WPHead from "components/webHelpers/WPHead";
import WPFooter from "components/webHelpers/WPFooter";
import styled from "@emotion/styled";
import { AuthorsTextWithLink } from "./pages/HomePage/AuthorView";
import AuthorBox from "./AuthorBox";
import { CategoryLink } from "./CategoryLink";
import { DateWithAbbr } from "./DateView";
import HumorGlobal from "./HumorGlobal";
import DataVizGlobal from "./DataVizGlobal";
import FooterDonationBanner from "components/FooterDonationBanner";
import css from "@emotion/css";
import axios from "axios";

import ContentViewStyles, {
  centerOuterContentStyle,
  centerContentStyle,
} from "./ContentViewStyles";

// PostTitle is headline if post is an article
const PostTitle = styled.h1({
  ...centerContentStyle,
  ...FONTS.ARTICLE_TITLE,
  textAlign: "center",
  fontSize: "2rem",
  lineHeight: "1.5em",
  [`@media (max-width: ${BREAKPOINTS.TABLET}px)`]: {
    fontSize: "1.4rem",
  },
});

// PostSubtitle is subheadline if post is an article
const PostSubtitle = styled.h2({
  ...centerContentStyle,
  ...FONTS.ARTICLE_TITLE,
  textAlign: "center",
  fontSize: "1.1rem",
  lineHeight: "1.4em",
  color: "gray",
  [`@media (max-width: ${BREAKPOINTS.TABLET}px)`]: {
    fontSize: "1rem",
  },
});

// e.g. "By Firstname Lastname on July 25, 2020"
const Byline = styled.p({
  ...FONTS.AUXILIARY,
  fontWeight: "bold",
  textTransform: "none",
  marginTop: "1em",
});

// Describes requirement of various properties of specific types
// https://www.typescriptlang.org/docs/handbook/interfaces.html
interface ContentViewProps {
  post: Post;
}

// Component containing body of post and other relevant information
const ContentView: React.ElementType<ContentViewProps> = ({
  post,
}: ContentViewProps) => {
  if (!post) {
    return <LoadingView />;
  }

  const {
    id: postId,
    postTitle,
    postSubtitle,
    thumbnailInfo,
    tsdAuthors,
    tsdCategories, // e.g. News
    tsdPrimaryCategory, // for articles with more than one, selected in WordPress
    postContent,
    postType,
    commentStatus, // determines whether Disqus appears below article
    guid,
  } = post;

  if (postId === 1150447) {
    console.log(postId);
    axios.get(
      "https://stanforddaily.com/wp-json/wp/v2/posts/" + postId + "/views",
    );
  }

  const {
    urls: { full: thumbnailUrl = null } = {},
    caption: thumbnailCaption = null,
    alt: thumbnailAlt = thumbnailCaption,
  } = thumbnailInfo || {};

  const isPost = postType === "post";

  const isHumor = // Need to know this so we can put "Humor by" in byline and do humor styling
    tsdCategories && tsdCategories.find(category => category.slug === "humor");

  let isDataViz = false; // Also need to know whether to apply special styling for data coverage
  if (
    tsdCategories &&
    tsdCategories.find(category => category.slug === "94305")
  ) {
    isDataViz = true;
  }

  return (
    <SectionStyle>
      <WPHead base={post} />
      {isHumor && <HumorGlobal />}
      {isDataViz && <DataVizGlobal />}
      <Article>
        <ArticleHeader>
          {isPost && (
            <div
              css={{
                ...centerContentStyle,
                textAlign: "center",
              }}
            >
              <CategoryLink
                category={tsdPrimaryCategory}
                style={{
                  fontSize: 20,
                }}
              />
            </div>
          )}
          <PostTitle>{postTitle}</PostTitle>
          {postSubtitle ? (
            <PostSubtitle>{postSubtitle}</PostSubtitle>
          ) : (
            undefined
          )}
        </ArticleHeader>
        <Global styles={ContentViewStyles} />
        <RView
          WebTag="main"
          id="main-article-content"
          css={css`
            @media print {
              a {
                text-decoration: none !important;
                border-bottom: none !important;
                color: #2e2d29;
              }
            }
          `}
        >
          {thumbnailUrl ? (
            <figure
              id="featured-image"
              css={css`
                @media print {
                  display: none;
                }
              `}
            >
              <img src={thumbnailUrl} alt={thumbnailAlt} />
              {thumbnailCaption ? (
                <figcaption style={{ marginBottom: 0 }}>
                  {thumbnailCaption}
                </figcaption>
              ) : (
                undefined
              )}
            </figure>
          ) : (
            undefined
          )}
          {isPost && (
            <Byline>
              <span>{isHumor ? "Humor by" : "By"}</span>{" "}
              <AuthorsTextWithLink
                authors={tsdAuthors}
                aStyle={{
                  textDecoration: "underline",
                }}
              />{" "}
              <span>
                <DateWithAbbr post={post} format="on MMMM D, YYYY" />
              </span>
            </Byline>
          )}
          <div id="main-article-text" />
          {/* TODO: UNKNOWN WHY THIS IS NECESSARY FOR SOME POSTS TO SHOW UP: E.G. https://www.stanforddaily.com/2019/11/20/the-disappearance-of-financial-aid-how-stanford-consumes-outside-scholarships-when-need-based-aid-doesnt-fulfill-student-needs/ */}
          <div
            id="main-article-text2"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: postContent.replace(
                /Contact(.)*(')*(‘*)at(’)*(')*( )*stanford.edu(.)*/i,
                "",
              ),
            }}
          />
          {console.log(postContent)}
        </RView>
        {isPost && ( // For article/content posts, we want donation box and author box at bottom
          <footer css={centerOuterContentStyle} style={{ marginTop: 30 }}>
            <FooterDonationBanner
              currentPageUrl={"https://www.stanforddaily.com"}
            />
            {tsdAuthors.map(author => (
              <AuthorBox key={author.id} author={author} />
            ))}
          </footer>
        )}
      </Article>
      {commentStatus === "open" && (
        <div
          css={css`
            @media print {
              display: none;
            }
          `}
        >
          <div css={{ ...centerContentStyle }}>
            {/* We have to embed disqus this way (and not through disqus-react) because disqus-react requires
            Next JS's javascript code to be running -- and we had to turn off the Next JS javascript code
            on article pages in order to fix some integration issues with Ezoic.
        */}
            <div id="disqus_thread"></div>
            <div
              dangerouslySetInnerHTML={{
                __html: `
            <script id="tsd-disqus-data" type="application/json">${JSON.stringify(
              {
                url: guid,
                identifier: `${postId} ${guid}`, // From `dsq_identifier_for_post` in Disqus WordPress plugin
              },
            )}</script>
            <script>
            var disqus_config = function () {
                var disqus_data = JSON.parse(document.getElementById("tsd-disqus-data").innerHTML);
                this.page.url = disqus_data.url;
                this.page.identifier = disqus_data.identifier;
            };
            (function() {
                var d = document, s = d.createElement('script');
                
                // IMPORTANT: Replace EXAMPLE with your forum shortname!
                s.src = 'https://stanforddaily.disqus.com/embed.js';
                
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);
            })();
          </script>
          `,
              }}
            />
          </div>
        </div>
      )}
      <WPFooter base={post} />
    </SectionStyle>
  );
};

export default ContentView;
