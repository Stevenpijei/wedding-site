import { IAdminStats } from 'interface/dashboard';

export const generateLineData = (isCompared: boolean, data: IAdminStats, legend1: string, legend2: string) => {
    const lineData: any = {
        labels: [],
        datasets: [
            {
                label: legend1,
                data: [],
                fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.2)',
            },
        ],
    };
    const secondDataSets = {
        label: legend2,
        data: [],
        fill: false,
        backgroundColor: 'rgb(54, 162, 235)',
        borderColor: 'rgba(54, 162, 235, 0.2)',
    };
    lineData.datasets[0].data.push(...(data.main_set?.map((i) => i.count) || []));
    if (isCompared) {
        lineData.datasets.push(secondDataSets);
        lineData.labels.push(
            ...(data.main_set?.map(
                (i, idx) =>
                    `${i.label}   ${(data.compare_set && data.compare_set[idx] && data.compare_set[idx].label) || ' '}`
            ) || [])
        );
        lineData.datasets[1].data.push(...(data.compare_set?.map((i) => i.count) || []));
    } else {
        lineData.labels.push(...(data.main_set?.map((i) => i.label) || []));
    }
    return lineData;
};
