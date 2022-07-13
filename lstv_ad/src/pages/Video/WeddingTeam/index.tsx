import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@material-ui/core';

import RegularButton from 'components/CustomBtns/Button';
import { ISlugWithName, IVideo, IVideoWeddingTeam } from 'interface';
import WeddingItem from './WeddingItem';
import { usePatchVideoWeddingTeam, useVideoWeddingTeam } from 'service/hooks/video';
import LoadingIndicator from 'components/LoadingIndicator';
import { ToastContext } from 'contexts/ToastContext';

interface Props {
    data: IVideo;
}

const WeddingTeam: React.FC<Props> = ({ data }: Props) => {
    const { showToast } = useContext(ToastContext);
    const { data: weddingTeamResponse, isLoading: isWeddingTeamLoading } = useVideoWeddingTeam(data.id);
    const { mutateAsync: requestPatchWeddingTeam, isLoading: isPatching } = usePatchVideoWeddingTeam();
    const [weddingTeams, setWeddingTeams] = useState<IVideoWeddingTeam[]>([]);
    useEffect(() => {
        if (weddingTeamResponse) {
            setWeddingTeams(weddingTeamResponse.result);
        }
    }, [weddingTeamResponse]);

    const handleAddClick = () => {
        setWeddingTeams((prev) => [...prev, {} as IVideoWeddingTeam]);
    };

    const handleRemove = (idx: number) => {
        setWeddingTeams((prev) => {
            const _prev = [...prev];
            _prev.splice(idx, 1);
            return _prev;
        });
    };

    const handleUpdate = (
        idx: number,
        business: ISlugWithName | null,
        role: ISlugWithName | null,
        capacity: ISlugWithName | null
    ) => {
        setWeddingTeams((prev) => {
            const _prev = [...prev];
            _prev.splice(idx, 1, {
                role_name: role?.name as string,
                role_slug: role?.slug as string,
                business_capacity_type_slug: capacity?.slug as string,
                business_capacity_type_name: capacity?.name as string,
                slug: business?.slug as string,
                name: business?.name as string,
            } as IVideoWeddingTeam);
            return _prev;
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        try {
            await requestPatchWeddingTeam({
                videoId: data.id,
                weddingTeams: weddingTeams.map(({ slug, role_slug, business_capacity_type_slug }) => ({
                    slug,
                    role_slug,
                    role_capacity_slug: business_capacity_type_slug,
                })),
            });
            showToast({
                type: 'success',
                message: 'Successfully updated the wedding teams.',
            });
        } catch (e) {
            showToast({
                type: 'error',
                message: `Failed to update the wedding teams. ${e.message}`,
            });
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Box textAlign="right" mt="20px">
                <RegularButton className="round_btn" type="submit" loading={isWeddingTeamLoading || isPatching}>
                    Save
                </RegularButton>
            </Box>
            {isWeddingTeamLoading && <LoadingIndicator />}
            {!isWeddingTeamLoading &&
                weddingTeams.map((weddingTeam, idx) => (
                    <WeddingItem
                        data={weddingTeam}
                        key={`${JSON.stringify(weddingTeam)}-${idx}`}
                        onRemove={handleRemove}
                        idx={idx}
                        onUpdate={handleUpdate}
                    />
                ))}
            <Box textAlign="left" mt="20px">
                <RegularButton className="round_btn" onClick={handleAddClick}>
                    Add
                </RegularButton>
            </Box>
        </Box>
    );
};

export default WeddingTeam;
