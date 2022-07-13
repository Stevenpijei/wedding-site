export const mockVibe = {
    name: 'Bohemian',
    slug: 'bohemian',
    weight: 1980,
    type: 'Wedding Style',
    importance: '00007-01980',
    type_group: 'wedding_tag',
    description:
        'Whether youre getting married in a countryside barn or a luxury hotel ballroom, you can plan a rustic wedding. From outdoor Whether youre getting married in a countryside barn or a luxury hotel ballroom, you can plan a rustic ',
};

export const videosMock = new Array(8).fill({
    cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
    thumbnailUrl: 'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/2Qzxwi1h.png',
    thumbnailAlt: 'test',
    premium: true,  
    coupleNames: 'Jack & Jill',
    videographer: 'NST Pictures',
    venueName: 'The Plaza Hotel',
    location: 'New York, NY',
    views: 31223,
    likes: 423,
    vibes: ['Cool', 'Fun', 'Nutty'],
    duration: 234,
});

export const promoVideosMock = new Array(2).fill({
    cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
    thumbnailUrl: 'https://lstv-content.s3.us-east-2.amazonaws.com/thumbnails/2Qzxwi1h.png',
    thumbnailAlt: 'test',
    premium: true,
    title: 'Jack & Jill',
    coupleNames: 'Jack & Jill',
    videographer: 'NST Pictures',
    venueName: 'The Plaza Hotel',
    location: 'New York, NY',
    views: 31223,
    likes: 423,
    vibes: ['Cool', 'Fun', 'Nutty'],
    duration: 234,
});

export const postMock = {
    id: '9ab06383-aa72-4ab3-9d30-ef02765d0081',
    slug: 'jess-rudy-wedding-video-april-2019',
    title: null,
    type: 'event',
    videos: [
        {
            id: 'a8360a6d-254b-4462-82b1-387e30eae6c0',
            created_at: '2020-02-14',
            event_date: '2019-04-27',
            order: 1,
            title: 'Jess + Rudy | Tulum, Mexico | Akiin Beach Club',
            short_url_token: 'v9ef7',
            location: {
                country: 'Mexico',
                country_url: '/location/?country=mexico',
                state_province: 'Quintana Roo',
                state_province_url: '/location/?country=mexico&state_province=quintana-roo',
                place: 'Tulum',
                place_url: '/location/?country=mexico&state_province=quintana-roo&place=tulum',
            },
            content:
                'Jess and Rudy met through mutual friends at college! They kissed on Jessica\'s 21st birthday to "check off" an item off her birthday scavenger hunt list, which eventually led them to make things official. \r\n\r\nThese two love to travel, and Tulum being one of their favorite places, it was only fitting that they get married there! From Raleigh, North Carolina, all the way to Mexico- Surrounded by 100 of their closest friends and family, Jess and Rudy said their vows on the beach with the sound of waves crashing in the background. ',
            type: 'wedding-ceremony-and-reception',
            views: 68,
            likes: 1,
            shares: 0,
            businesses: [
                {
                    name: 'Watters',
                    slug: 'watters',
                    role_name: 'Dress Designer',
                    role_name_is: null,
                    role_slug: 'dress-designer',
                    premium: false,
                    role_family: 'fashion',
                    weight: 158,
                },
                {
                    name: 'The Black Tux',
                    slug: 'the-black-tux',
                    role_name: 'Suit Designer',
                    role_name_is: null,
                    role_slug: 'suit-designer',
                    premium: false,
                    role_family: 'fashion',
                    weight: 145,
                    business_capacity_type_name: "Groom's Suit Designer",
                    business_capacity_type_slug: 'groom-suit-designer',
                },
                {
                    name: 'Madison Grey Media',
                    slug: 'madison-grey-media',
                    role_name: 'Videographer',
                    role_name_is: null,
                    role_slug: 'videographer',
                    premium: false,
                    role_family: 'video-photo',
                    weight: 19,
                },
                {
                    name: 'Akiin Beach Club',
                    slug: 'akiin-beach-club',
                    role_name: 'Venue',
                    role_name_is: null,
                    role_slug: 'venue',
                    premium: false,
                    role_family: 'venue',
                    weight: 6,
                    business_capacity_type_name: 'Reception Venue',
                    business_capacity_type_slug: 'reception-venue',
                },
                {
                    name: 'Arika Jordan Photography',
                    slug: 'arika-jordan-photography',
                    role_name: 'Photographer',
                    role_name_is: null,
                    role_slug: 'photographer',
                    premium: false,
                    role_family: 'video-photo',
                    weight: 1,
                },
                {
                    name: 'LM Weddings',
                    slug: 'lm-weddings',
                    role_name: 'Event Designer',
                    role_name_is: null,
                    role_slug: 'event-designer',
                    premium: false,
                    role_family: 'planning-design',
                    weight: 1,
                },
                {
                    name: 'Pure Love Floral Design',
                    slug: 'pure-love-floral-design',
                    role_name: 'Florist',
                    role_name_is: null,
                    role_slug: 'florist',
                    premium: false,
                    role_family: 'florals',
                    weight: 1,
                },
            ],
            vibes: [
                {
                    name: 'American',
                    slug: 'american',
                    weight: 1858,
                    type: 'Culture/Religion',
                    importance: '00010-00000',
                    type_group: 'wedding_tag',
                },
                {
                    name: 'Bohemian',
                    slug: 'bohemian',
                    weight: 1884,
                    type: 'Wedding Style',
                    importance: '00007-00000',
                    type_group: 'wedding_tag',
                },
                {
                    name: 'Love Story',
                    slug: 'love-story',
                    weight: 3046,
                    type: 'Wedding Style',
                    importance: '00007-00000',
                    type_group: 'wedding_tag',
                },
                {
                    name: 'Destination',
                    slug: 'destination',
                    weight: 2332,
                    type: 'Wedding Style',
                    importance: '00007-00000',
                    type_group: 'wedding_tag',
                },
                {
                    name: 'Romantic',
                    slug: 'romantic',
                    weight: 5627,
                    type: 'Wedding Style',
                    importance: '00007-00000',
                    type_group: 'wedding_tag',
                },
                {
                    name: 'Fun',
                    slug: 'fun',
                    weight: 3982,
                    type: 'Wedding Style',
                    importance: '00007-00000',
                    type_group: 'wedding_tag',
                },
                {
                    name: 'Bride & Groom',
                    slug: 'bride-groom',
                    weight: 13462,
                    type: 'Sexual Orientation',
                    importance: '00001',
                    type_group: 'wedding_tag',
                },
            ],
            properties: {},
            videos: [
                {
                    id: '568a67e4-8449-4b8b-be2c-3c3c4c61167a',
                    type: 'jwplayer',
                    media_id: '5WeklUde',
                    duration: 376,
                    width: 1920,
                    height: 1080,
                    thumbnail_url:
                        'https://d3g1ohya32imgb.cloudfront.net/images/site/content/e38b738cb09720921d1487fcf7bc2233929a4d29-orig.png',
                    preview_gif_url: 'https://d3g1ohya32imgb.cloudfront.net/videos/previews/5WeklUde.gif',
                    order: 1,
                },
            ],
            photos: [],
            songs: [],
        },
    ],
    properties: { spouse_1: 'Jess', spouse_2: 'Rudy' },
};

export const teamMock = {
    members: [
        {
            name: 'Roberto Huot',
            role: 'Senior Videographer',
            thumbnailUrl:
                'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1026&q=80',
        },
        {
            name: 'Elon Musk',
            role: 'Junior Videographer',
            thumbnailUrl:
                'https://images.unsplash.com/photo-1485893086445-ed75865251e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
        },
        {
            name: 'Matt Helders',
            role: 'Senior Videographer',
            thumbnailUrl:
                'https://images.unsplash.com/photo-1485893086445-ed75865251e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
        },
        {
            name: 'Alex Turner',
            role: 'Senior Videographer',
            thumbnailUrl:
                'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1026&q=80',
        },
    ],
};

export const mockSoldAt = [
        {
            cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
            premium: true,
            name: 'Beautini',
            role: {
                name: 'Videographer',
                slug: 'videographer',
                family_type: 'video-photo',
            },
        },
        {
            cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
            premium: true,
            name: 'Prettier',
            role: {
                    name: 'Catering',
                    slug: 'catering',
                    family_type: 'food_beverage',
                },
        },
    ];
    
    export const mockFamilyOfBrands = [
        {
            thumbnailUrl:
                'https://images.unsplash.com/photo-1530018352490-c6eef07fd7e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=961&q=80',
        },
        {
            thumbnailUrl:
                'https://images.unsplash.com/photo-1553835973-dec43bfddbeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80',
        },
    ];

export const mockEvents = [
    {
        id: 1,
        date: '09 Oct',
        place: 'Wedding Shope',
        location: 'Campbell, CA, United States',
        slug: 'Wedding Shope',
    },
    {
        id: 2,
        date: '29 Oct',
        place: 'Wedding Shope',
        location: 'Campbell, CA, United States',
        slug: 'Wedding Shope',
    },
    {
        id: 3,
        date: '07 Nov',
        place: 'Wedding Shope',
        location: 'Campbell, CA, United States',
        slug: 'Wedding Shope',
    },
];

export const mockPhotos = [
    {
        id: '65c1a0d7-cce2-465c-80f6-812c6fa61c2a',
        order: 0,
        url:
            'https://d3g1ohya32imgb.cloudfront.net/images/site/content/c8f305a76a365bb01b09f9ae06545d9c596b59c6-orig.jpg',
        width: 1920,
        height: 1280,
    },
    {
        id: '240e56fe-e45c-4f26-aa39-620329487a5a',
        order: 0,
        url:
            'https://d3g1ohya32imgb.cloudfront.net/images/site/content/e44673ad87419ad86d030704b5938d070a44aced-orig.jpg',
        width: 1920,
        height: 1280,
    },
    {
        id: '838c2d40-3acc-4ebc-bac1-b35feaaa2c29',
        order: 0,
        url:
            'https://d3g1ohya32imgb.cloudfront.net/images/site/content/ad84d0018f795810ef92a87aafe71045ab8d862d-orig.jpg',
        width: 1280,
        height: 1920,
    },
    {
        id: '2f970fa9-f396-46bb-a01d-b3057c430a66',
        order: 0,
        url:
            'https://d3g1ohya32imgb.cloudfront.net/images/site/content/d0b7e74a77de94886d44b3d71ce817366a6d14a1-orig.jpg',
        width: 1920,
        height: 1280,
    },
    {
        id: '951a52f6-c227-470c-b6c4-c3e356a923c5',
        order: 0,
        url:
            'https://d3g1ohya32imgb.cloudfront.net/images/site/content/8fb686cd4b3d2fb992ca7b5fae983c95bb796871-orig.jpg',
        width: 1920,
        height: 1280,
    },
];

export const mockShopping = [
        {
            id: '5092ec92-82e0-4594-a506-bbdb21702edf',
            name: 'Adele',
            shop_url: 'https://www.maggiesottero.com/maggie-sottero/adele/16873',
            thumbnail_url:
                'https://ms-cdn2.maggiesottero.com/106645/High/Maggie-Sottero-Adele-21MW424-Alt2-IV.jpg?w=550&dpr=2',
            price_cents: 159999,
            old_price_cents: null,
            discount_label: null,
            currency_symbol: '$',
        },
        {
            id: '6385168b-5d7b-4bd3-9c68-9949e512a1cb',
            name: 'Milk Chocolate Covered Brazil Nuts',
            shop_url:
                'https://www.ebay.com/itm/Milk-Chocolate-Covered-Brazil-Nuts/233701290731?var=533391755696&hash=item3669aeb2eb:g:N0YAAOSwNkhfUQwK',
            thumbnail_url:
                'https://nuts.com/images/rackcdn/ed910ae2d60f0d25bcb8-80550f96b5feb12604f4f720bfefb46d.ssl.cf1.rackcdn.com/22a887343227aade-fG9UUWDx-zoom.jpg',
            price_cents: 499,
            old_price_cents: 699,
            discount_label: 'Old price',
            currency_symbol: '$',
        },
        {
            id: '6385168b-5d7b-4bd3-9c68-9949e512a1cb',
            name: 'Milk Chocolate Covered Brazil Nuts',
            shop_url:
                'https://www.ebay.com/itm/Milk-Chocolate-Covered-Brazil-Nuts/233701290731?var=533391755696&hash=item3669aeb2eb:g:N0YAAOSwNkhfUQwK',
            thumbnail_url:
                'https://nuts.com/images/rackcdn/ed910ae2d60f0d25bcb8-80550f96b5feb12604f4f720bfefb46d.ssl.cf1.rackcdn.com/22a887343227aade-fG9UUWDx-zoom.jpg',
            price_cents: 499,
            old_price_cents: 699,
            discount_label: 'Old price',
            currency_symbol: '$',
        },
        {
            id: '6385168b-5d7b-4bd3-9c68-9949e512a1cb',
            name: 'Milk Chocolate Covered Brazil Nuts',
            shop_url:
                'https://www.ebay.com/itm/Milk-Chocolate-Covered-Brazil-Nuts/233701290731?var=533391755696&hash=item3669aeb2eb:g:N0YAAOSwNkhfUQwK',
            thumbnail_url:
                'https://nuts.com/images/rackcdn/ed910ae2d60f0d25bcb8-80550f96b5feb12604f4f720bfefb46d.ssl.cf1.rackcdn.com/22a887343227aade-fG9UUWDx-zoom.jpg',
            price_cents: 499,
            old_price_cents: 699,
            discount_label: 'Old price',
            currency_symbol: '$',
        },
        {
            id: '6385168b-5d7b-4bd3-9c68-9949e512a1cb',
            name: 'Milk Chocolate Covered Brazil Nuts',
            shop_url:
                'https://www.ebay.com/itm/Milk-Chocolate-Covered-Brazil-Nuts/233701290731?var=533391755696&hash=item3669aeb2eb:g:N0YAAOSwNkhfUQwK',
            thumbnail_url:
                'https://nuts.com/images/rackcdn/ed910ae2d60f0d25bcb8-80550f96b5feb12604f4f720bfefb46d.ssl.cf1.rackcdn.com/22a887343227aade-fG9UUWDx-zoom.jpg',
            price_cents: 499,
            old_price_cents: 699,
            discount_label: 'Old price',
            currency_symbol: '$',
        },
];