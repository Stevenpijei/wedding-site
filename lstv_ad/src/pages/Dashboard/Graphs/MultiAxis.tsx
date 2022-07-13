import LoadingIndicator from 'components/LoadingIndicator';
import { IAdminStats } from 'interface/dashboard';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { generateLineData } from './util';

interface Props {
    data: IAdminStats;
    isCompared: boolean;
    legend1: string;
    legend2: string;
}

const MultiAxis: React.FC<Props> = ({ data, isCompared, legend1, legend2 }: Props) => {
    const [lineData, setLineData] = useState<any>();

    useEffect(() => {
        setLineData(generateLineData(isCompared, data, legend1, legend2));
    }, [data, isCompared]);

    const options = {
        plugins: {
            title: {
                display: true,
                text: 'Video Uploads',
            },
        },
        animation: {
            duration: 1,
            onComplete: function () {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const _this: any = this;
                const ctx = _this.ctx;

                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                _this.data.datasets.forEach(function (dataset: any, i: any) {
                    const meta = _this.getDatasetMeta(i);
                    meta.data.forEach(function (bar: any, index: any) {
                        const data = dataset.data[index];
                        ctx.fillText(data, bar.x, bar.y - 5);
                    });
                });
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                max:
                    (lineData &&
                        Math.max(
                            ...[
                                ...lineData.datasets[0].data,
                                ...(lineData.datasets[1] ? lineData.datasets[1].data : []),
                            ]
                        ) + 10) ||
                    10,
            },
        },
    };

    const renderGraph = React.useMemo(() => <Bar data={lineData} options={options} type="bar" />, [
        JSON.stringify(lineData),
    ]);

    if (!lineData) return <LoadingIndicator />;

    return <div>{renderGraph}</div>;
};

export default MultiAxis;
