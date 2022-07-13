export type WinnerData = {
  media_id: string,
  thumbnail_url: string,
  award_svg_url: string,
  title: string,
  video_title: string,
  business_name: string,
  business_url: string,
  video_url: string,
  details_bg_color: string
}

const winningVideos: WinnerData[] = [{
  media_id: null,
  thumbnail_url: 'filmmaker-of-the-year.jpg',
  award_svg_url: '/images/2021-wfa/WFA_Filmmakeroftheyear.svg',
  title: 'Filmmaker of the Year',
  video_title: null,
  business_name: 'Marco De Nigris Weddings',
  business_url: '/business/marco-de-nigris-weddings',
  video_url: '/hugo-kirsty-wedding-video-august-2019',
  details_bg_color: "#EBA900"
}, {
  media_id: '04GWOjcw',
  thumbnail_url: 'best-film-of-the-year.jpg',
  award_svg_url: '/images/2021-wfa/WFA_Filmoftheyear.svg',
  title: 'Film of the Year',
  video_title: 'Dan & Cassidy by Sculpting with Time',
  business_name: 'Sculpting with Time',
  business_url: '/business/sculpting-with-time',
  video_url: '/dan-cassidy-wedding-video-october-2020',
  details_bg_color: "#2D0AB9"
}, {
  media_id: 'pzrCp5RX',
  thumbnail_url: 'wedding-of-the-year.jpg',
  award_svg_url: '/images/2021-wfa/WFA_Weddingoftheyear.svg',
  title: 'Wedding of the Year',
  video_title: 'Shae & Tudor by AndHer Visuals',
  business_name: 'AndHer Visual',
  business_url: '/business/andher-visuals',
  video_url: '/shae-tudor-wedding-video-march-2020',
  details_bg_color: "#8AEC81"
}, {
  media_id: null,
  thumbnail_url: 'best-new-filmmaker.jpg',
  award_svg_url: '/images/2021-wfa/WFA_bestnewfilmmaker.svg',
  title: 'Best New Filmmaker',
  video_title: null,
  business_name: 'Honey Fox Films',
  business_url: '/business/honey-fox-films',
  video_url: '/baylee-caleb-wedding-video-november-2020',
  details_bg_color: "#EBC7B7"
}, {
  media_id: '2uygHRzk',
  thumbnail_url: 'best-international-film.jpg',
  award_svg_url: '/images/2021-wfa/WFA_BestInternationalFilm.svg',
  title: 'Best International Film',
  video_title: 'Peter & Elizabeth by Liefste Dag',
  business_name: 'Liefste Dag',
  business_url: '/business/liefste-dag',
  video_url: '/peter-elizabeth-wedding-video-december-2018',
  details_bg_color: "#FF7A00"
}, {
  media_id: '5cqnhlIP',
  thumbnail_url: 'best-micro-wedding.jpg',
  award_svg_url: '/images/2021-wfa/WFA_BestMicroWedding.svg',
  title: 'Best Micro Wedding',
  video_title: 'Elizabeth + Jack by Films by Madeleine',
  business_name: 'Films By Madeleine',
  business_url: '/films-by-madeleine',
  video_url: '/elizabeth-jack-wedding-video-august-2020',
  details_bg_color: "#53B1C5",
}, {
  media_id: 'bVMJGUxS',
  thumbnail_url: 'best-social-editing.jpg',
  award_svg_url: '/images/2021-wfa/WFA_BestSocialEditing.svg',
  title: 'Best Social Editing',
  video_title: 'Carly & Germain by Films Nouveau',
  business_name: 'Films Nouveau',
  business_url: '/business/films-nouveau',
  video_url: '/carly-germain-wedding-video-july-2019',
  details_bg_color: "#C84F4F",
}, {
  media_id: 'ByIARhpb',
  thumbnail_url: 'best-fashion-moments.jpg',
  award_svg_url: '/images/2021-wfa/WFA_BestFashionMoment.svg',
  title: 'Best Fashion Moment',
  video_title: 'Devin & Joonas by Flom Films',
  business_name: 'Flom Films',
  business_url: '/business/flom-films',
  video_url: '/devin-joonas-wedding-video-november-2020',
  details_bg_color: "#790074",
}]

export default winningVideos