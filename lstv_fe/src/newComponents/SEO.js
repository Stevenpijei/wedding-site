import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import {FRONT_END_SETTINGS_HOME_PAGE_TITLE} from "../global/globals";

const SEO = ({ postTitle, postDescription, postImage, url, isBlogPost }) => {
    // AK: wat
    const fbAppID = 'meow'

    return (
        <Helmet>
        {/* General tags */}
        <title>{postTitle}</title>
        <meta name="description" content={postDescription} />
        <meta name="image" content={postImage} />
        <link rel="canonical" href={url} />

        <meta name="google-site-verification" content="aZtM86v2fpEiv2ZV2vBP95b68m9s763JMpsERLRBYPo" />
        <meta charSet="utf-8" />

        {/* OpenGraph tags */}
        <meta property="og:url" content={url} />
        {isBlogPost ? <meta property="og:type" content="article" /> : null}
        <meta property="og:title" content={postTitle} />
        <meta property="og:description" content={postDescription} />
        <meta property="og:image" content={postImage} />
        <meta property="fb:app_id" content={fbAppID} />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content={'@LoveStoriesTV'} />
        <meta name="twitter:title" content={postTitle} />
        <meta name="twitter:description" content={postDescription} />
        <meta name="twitter:image" content={postImage} />
        </Helmet>
    );
}

SEO.propTypes = {
  postTitle: PropTypes.string,
  postDescription: PropTypes.string,
  postImage: PropTypes.string,
  url: PropTypes.string,
  isBlogPost: PropTypes.bool,
};

SEO.defaultProps = {
  postTitle: FRONT_END_SETTINGS_HOME_PAGE_TITLE,
  postDescription: "The New Way To Plan Your Wedding.",
//  TODO  default image needs to be updated
  postImage: "https://d3g1ohya32imgb.cloudfront.net/images/site/content/53de5d2ed18a48b58c80188eb0502de977a8705a-orig.png",
  url: 'https://lovestoriestv.com/',
  isBlogPost: false,
};

export default SEO;


