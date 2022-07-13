import React, { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { BeatLoader } from 'react-spinners';
import styled from 'styled-components';
import theme from '../../../styledComponentsTheme';
import PinnedVideos from './PinnedVideos';
import VideoInfoModal from './VideoInfoModal';
import { ColumnHeaders, VideoRow } from './VideoRow';
import { VideosModal } from './VideosModal';
import Tabs from '/components/Tabs';
import LSTVLink from '/components/Utility/LSTVLink';
import { PublishIcon } from '/components/Utility/LSTVSVG';
import { LSTV_YELLOW, POPUP_MESSAGE_POSITION_TOP_RIGHT } from '/global/globals';
import BaseCTAButton from '/newComponents/buttons/BaseCtaButton';
import { useHideFooter } from '/newComponents/layout/Layout';
import { useAuthService } from '/rest-api/hooks/useAuthService';
import { useBusinessService } from '/rest-api/hooks/useBusinessService';
import { popMessageError, popMessageSuccess, isPaidUser, isVideographerUser } from '/utils/LSTVUtils';
import HorizontalRule from '/components/HorizontalRule'
import PromoUpgradeBanner from './PromoUpgradeBanner'

const Container = styled.div`
  padding: 40px 60px;
  // keeps the sidebar menu sticky even when a video list is short
  min-height: 500px;
  height: 100%;
`;

const StyledTitle = styled.h2`
  font-family: Heldane Display Test;
  font-style: normal;
  font-weight: bold;
  font-size: 2rem;
  line-height: 124.4%;
`;

const SubTitle = styled.p`
  font-family: Calibre;
  font-style: normal;
  font-weight: normal;
  font-size: 1.25rem;
  line-height: 1.375rem;
  margin: 10px 0 16px;
  color: ${theme.black};
`;

const RowContainer = styled.div`
  /* box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); */
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const NoVideos = styled.div`
  background: ${(props) => props.theme.lightGrey};
  border: 1px solid ${(props) => props.theme.midGrey};
  border-radius: 10px;
  padding: 40px;
  margin-top: 20px;

  h2 {
    font-family: Heldane Display Test;
    font-weight: bold;
    font-size: 2rem;
    line-height: 124.4%;
    margin-bottom: 40px;
  }
`;

const tabs = [{
  id: 'wedding',
  label: 'Wedding'
}, {
  id: 'promo',
  label: 'Promo'
}]

const listSize = 20

const Videos = () => {
  const {
    getBusinessVideosDashboard,
    getPinnedVideosDashboard,
    postPinnedVideoOrder,
    deleteBusinessVideo,
  } = useBusinessService();
  const { user } = useAuthService();

  const isPaid = useMemo(() => isPaidUser(user), [user])
  const isVideographer = useMemo(() => isVideographerUser(user), [user])

  // paying non-videographer users can upload only promo vids
  // so default to that tab view - we'll hide the tab bar
  const initTab = isPaid && !isVideographer ? 1 : 0

  // obviously have to rework the tab === x logic if
  // we ever have more than 2 tabs.
  const [tab, setTab] = useState(initTab)

  const [weddingVideos, setWeddingVideos] = useState([]);
  const [pinnedWeddingVideos, setPinnedWeddingVideos] = useState([]);
  const [totalWedding, setTotalWedding] = useState(0);
  const [weddingOffset, setWeddingOffset] = useState(0);

  const [promoVideos, setPromoVideos] = useState([])
  const [totalPromo, setTotalPromo] = useState(0);
  const [promoOffset, setPromoOffset] = useState(0)

  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [videoToEdit, setVideoToEdit] = useState()
  const [videoId, setVideoId] = useState(undefined);
  const [modalType, setModalType] = useState('delete');
  const [values, setValues] = useState({});

  const { ref: weddingRef, inView: weddingInView } = useInView({
    threshold: 0.2,
  });
  const { ref: promoRef, inView: promoInView } = useInView({
    threshold: 0.2,
  });

  useHideFooter()

  useEffect(() => {
    loadVideos(0, listSize);
  }, []);

  useEffect(() => {
    if (weddingInView && tab === 0) {
      if (totalWedding > weddingVideos.length) {
        loadVideos(weddingOffset + listSize, listSize, 'wedding');
        setWeddingOffset(weddingOffset + listSize);
      }
    }

    if (promoInView && tab === 1) {
      if (totalPromo > promoVideos.length) {
        loadVideos(promoOffset + listSize, listSize, 'promo')
        setPromoOffset(promoOffset + listSize)
      }
    }
  }, [weddingInView, promoInView]);

  useEffect(() => {
    if (videoToEdit) setIsEditModalOpen(true)
  }, [videoToEdit])

  useEffect(() => {
    if (!isEditModalOpen) setVideoToEdit(null)
  }, [isEditModalOpen])

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const transformandPost = async (list, message = "Updated video order") => {
    const transformed = list.map((item, index) => ({
      order: index + 1,
      video_id: item.video_id,
    }));
    const pinnedResponse = await postPinnedVideoOrder(user.businessSlug, transformed);

    if (pinnedResponse && pinnedResponse.success) {
      popMessageSuccess(message, '', POPUP_MESSAGE_POSITION_TOP_RIGHT, 50)
    } else {
      popMessageError('Error: try again later');
    }
    return transformed;
  };

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    const videos = reorder(pinnedWeddingVideos, result.source.index, result.destination.index);
    transformandPost(videos);
    setPinnedWeddingVideos(videos);
  };

  const filterOutPinned = (videosArr, pinned) => {
    const filtered = videosArr.filter(vid => {
      return !pinned.find((pin) => vid.video_id === pin.video_id)
    })
    return filtered
  }

  const loadVideos = async (offset, size, videoType) => {
    const pinnedResp = await loadPinnedVideos();

    try {
      const videosResponse = await getBusinessVideosDashboard(user.businessSlug, offset, size, videoType);

      // console.log('====================================')
      // console.log('vid resp', videosResponse)
      // console.log('====================================')

      if (videosResponse?.success) {
        if (offset > 0) {
          setWeddingVideos([...weddingVideos, ...filterOutPinned(videosResponse.result, pinnedResp)]);

        } else {
          const videos = videosResponse.result
          const promoVideos = videos.filter(video => video.video_type === 'promo')
          const weddingVideos = videos.filter(video => video.video_type === 'wedding')

          setWeddingVideos(filterOutPinned(weddingVideos, pinnedResp));
          setTotalWedding(videosResponse.scope.wedding_total);

          setPromoVideos(promoVideos)
          setTotalPromo(videosResponse.scope.promo_total)
        }

        setLoading(false);
      }

    } catch (error) {
      popMessageError('We encountered an error while loading your videos. Please refresh the page to try again.')
      console.log(error);
    }
  };

  const loadPinnedVideos = async () => {
    try {
      const pinnedVideosResponse = await getPinnedVideosDashboard(user.businessSlug);

      if (pinnedVideosResponse && pinnedVideosResponse.success) {
        // AK: why are we doing this?
        const mapped = pinnedVideosResponse.result.map((vid) => ({
          ...vid,
          thumbnail_url: vid.video_thumbnail,
          title: vid.video_title,
          visibility: 'public',
          link: `${window.location.href}/${vid.video_slug}`,
        }));
        setPinnedWeddingVideos(mapped)
        return mapped
      }

    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const onMenuClick = (videoId, modalType, values) => {
    if (modalType === 'delete') {
      setVideoId(videoId);
      setModalType(modalType);
      setValues({ ...values });
      setIsDeleteModalOpen(true);

    } else if (modalType === 'edit') {
      const videos = weddingVideos.concat(pinnedWeddingVideos).concat(promoVideos)
      const video = videos.find(video => video.id === videoId)

      if (!video) {
        console.warn('Cannot find video w id', videoId)
        return
      }

      setVideoToEdit({ ...video })
    }
  };

  const onReorderClick = (videoId, isAlreadyPinned, status) => {
    if (status !== 'public') {
      popMessageError("Only 'Public' videos can be pinned. Publish your video to pin it");

    } else if (!isAlreadyPinned) {
      // add to pinned,
      const newPinned = [...pinnedWeddingVideos, weddingVideos.find((vid) => vid.video_id === videoId)];
      setPinnedWeddingVideos(newPinned);
      // remove from videos
      setWeddingVideos(weddingVideos.filter((vid) => vid.video_id !== videoId));
      transformandPost(newPinned, 'Video can now be ordered manually');

    } else if (isAlreadyPinned) {
      // remove from pinned,
      const newPinned = pinnedWeddingVideos.filter((vid) => vid.video_id !== videoId);
      setPinnedWeddingVideos(newPinned);
      // add to videos
      setWeddingVideos([...weddingVideos, pinnedWeddingVideos.find((vid) => vid.video_id === videoId)]);
      transformandPost(newPinned, 'Video is now ordered by wedding date');
    }
  };

  /**
   * Callback from the VideosInfoModal so we can update
   *  this video in the list.
   */
  const onVideoEdit = video => {
    const updatedVideos = [...weddingVideos]
    updatedVideos.forEach((v, index) => {
      if (v.id === video.id) {
        updatedVideos[index] = video
      }
    })
    setWeddingVideos(updatedVideos)
  }

  const handleSubmit = () => {
    if (modalType === 'delete') {
      deleteBusinessVideo(user.businessSlug, videoId).then((response) => {
        if (response && response.success) {
          if (values.video_type === 'wedding') {
            if (pinnedWeddingVideos.map(v => v.id).includes(videoId)) {
              setPinnedWeddingVideos(pinnedWeddingVideos.filter(video => video.id !== videoId))

            } else {
              setWeddingVideos(weddingVideos.filter(video => video.id !== videoId));
              setTotalWedding(totalWedding - 1)
            }

          } else if (values.video_type === 'promo') {
            setPromoVideos(promoVideos.filter(video => video.id !== videoId))
            setTotalPromo(totalPromo - 1)

          } else {
            console.warn('no video type was passed - cannot update list')
          }
        } else {
          console.warn('error in videos.js');
        }
      });
    }
  };

  const hasVideos = weddingVideos.length > 0 || pinnedWeddingVideos.length > 0 || promoVideos.length > 0
  const videoCount = tab === 0 ? weddingVideos.length + pinnedWeddingVideos.length : promoVideos.length
  const videoTotal = tab === 0 ? totalWedding + pinnedWeddingVideos.length : totalPromo
  const showHeaders =
    tab === 0 && (weddingVideos.length > 0 || pinnedWeddingVideos.length > 0) ||
    tab === 1 && promoVideos.length > 0

  return (
    <>
      <Container>
        <StyledTitle>Videos</StyledTitle>
        {hasVideos &&
          <SubTitle>
            Showing {videoCount} of {videoTotal}
          </SubTitle>
        }
        <HorizontalRule style={{ marginBottom: 30 }} />
        {isVideographer &&
          <Tabs
            tabs={tabs}
            value={tab}
            onChange={setTab}
          />
        }
        {!loading && hasVideos ?
          <>
            {showHeaders && <ColumnHeaders />}
            {tab === 0 ?
              <RowContainer>
                {pinnedWeddingVideos.length > 0 && (
                  <PinnedVideos
                    onDragEnd={onDragEnd}
                    pinnedVideos={pinnedWeddingVideos}
                    onMenuClick={onMenuClick}
                    onReorderClick={onReorderClick}
                  />
                )}
                {weddingVideos.map(video => (
                  <VideoRow
                    reorderable
                    key={video.video_id}
                    video={video}
                    onMenuClick={onMenuClick}
                    onReorderClick={onReorderClick}
                    pinned={false}
                  />
                ))}
                <div ref={weddingRef}></div>
              </RowContainer> :
              <RowContainer>
                {promoVideos.map(video =>
                  <VideoRow
                    reorderable={false}
                    key={video.video_id}
                    video={video}
                    onMenuClick={onMenuClick}
                  />
                )}
                <div ref={promoRef}></div>
                {!isPaid && <PromoUpgradeBanner style={{ marginTop: 60 }} />}
              </RowContainer>
            }
          </> :
          loading ?
            <LoadingContainer>
              <BeatLoader size={24} color={LSTV_YELLOW} loading={true} />
            </LoadingContainer> :
            <NoVideos>
              <h2>{`You haven't uploaded any videos yet`}</h2>
              <LSTVLink noStyle to='/dashboard/upload-video'>
                <BaseCTAButton title='Upload New Video' icon={<PublishIcon />} />{' '}
              </LSTVLink>
            </NoVideos>
        }
      </Container>
      {/* using this only for deletions now */}
      <VideosModal
        isVideoModalOpen={isDeleteModalOpen}
        onModalClose={() => setIsDeleteModalOpen(false)}
        videoId={videoId}
        modalType={modalType}
        values={values}
        setValues={setValues}
        onSubmit={handleSubmit}
      />
      {/* remove from dom when closing to reset internal state */}
      { isEditModalOpen &&
        <VideoInfoModal
          isOpen
          video={videoToEdit}
          onVideoEdit={onVideoEdit}
          onClose={() => setIsEditModalOpen(false)}
        />
      }
    </>
  );
};

export default Videos;
