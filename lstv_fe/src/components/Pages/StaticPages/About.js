import React from 'react';
import Text from './commonComponents/Text';
import Title from './commonComponents/Title';
import StaticPageLayout from './StaticPageLayout';
import VideoPlayer from '../../Video/VideoPlayer';

const About = ({}) => {
    return (
        <StaticPageLayout headerText="About">
            <Title>Love Stories TV is the new way to plan your wedding.</Title>

            <Text>
                We use real wedding videos to connect engaged couples with pros, products, and ideas for their weddings.{' '}
            </Text>

            <Text>
                Traditional wedding vendor platforms and directories rely on outdated photos and written reviews to try
                and match couples with the right professionals for their wedding. But there is a better way.{' '}
            </Text>

            <Text>
                Videos bring the talent and expertise of wedding pros to life. What better way to explore a wedding
                venue, experience an officiant’s style, research a planner’s work, or identify a band with the right
                level of energy than to watch videos of the real weddings they’ve worked.
            </Text>

            <Text>
                On lovestoriestv.com wedding videographers from all over the world upload real wedding videos and tag
                them with the venues, planners, florists, musicians, dress designers, photographers, and other vendors
                who worked on the wedding. We use this information to create vendor directories and business pages that
                feature each businesses.
            </Text>

            <Text style={{marginBottom: 37}}>
                Whether you are newly engaged and looking for a venue, in search of the perfect videographer to capture
                your day, or need hair and makeup artists for your wedding party, the professionals on lovestoriestv.com
                are ready to help.{' '}
            </Text>
            <VideoPlayer
                isAutoPlay={false}
                video={{
                    // id: '0e4a5336-9adf-4f83-9beb-c29b41d73da5',
                    order: 1,
                    type: 'youtube',
                    media_id: 'oUGykIYf5j0',
                    duration: null,
                    width: 1920,
                    height: 1080,
                    thumbnail_url: 'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/JafJj57Y.png',
                }}
            />
        </StaticPageLayout>
    );
};

export default About;
