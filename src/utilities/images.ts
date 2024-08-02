// list of all images hosted on cloudinary

type ImgType = {
    [key: string]: {
        label: string;
        url: string;
    };
};

const images: ImgType = {
    watermark: {
        label: "bidsloth-watermark",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688404665/mvp/trademark_nzmlq5.png",
    },
    redLogo: {
        label: "red-bo",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688404666/mvp/red-bo_jv3es6.png",
    },
    backLogo: {
        label: "Logo Black and White",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688404603/mvp/bidsloth_-_Black_and_white_face-02_edd3w6.png",
    },
    
    linkedInIcon: {
        label: "linkedin icon",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688404602/mvp/linkedin_oofit5.png",
    },
    twitterIcon: {
        label: "twitter icon",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688404602/mvp/twitter_dr7qng.png",
    },
    instagramIcon: {
        label: "instagram icon",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688404602/mvp/insta_sx7ajf.png",
    },
    messengerIcon: {
        label: "messenger icon",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688464357/mvp/messenger_dufrrx.png",
    },
    mailIcon: {
        label: "mail icon",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688464356/mvp/email_pd7egj.png",
    },
    whatsappIcon: {
        label: "whatsapp icon",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688464358/mvp/whatsapp_mf9lhe.png",
    },
    snapchatIcon: {
        label: "snapchat icon",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688464357/mvp/snapchat_wdktvi.png",
    },

    welcomeImg: {
        label: "welcome bo!",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688404665/mvp/welcome-image_hxvz8l.png",
    },
    winningImg: {
        label: "trophy bo!",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688404666/mvp/winner-image_d9s6fc.png",
    },
    waitingImg: {
        label: "waiting bo!",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688404666/mvp/waiting-image_ttidsp.png",
    },
    defaultImg: {
        label: "default bo!",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1688404647/mvp/default-bo_zhti1t.png",
    },
    memeImg: {
        label: "meme",
        url: "https://res.cloudinary.com/dfmz4mxod/image/upload/v1690021978/mvp/meme-brainstorms.png",
    }
};

export default images;
