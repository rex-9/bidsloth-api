// promotion Enum
export enum PromoType {
    INVITE = "invite",
}

// payment status type of the auction model
export enum PaymentStatus {
    PENDING = "pending",
    COMPLETE = "complete",
}

// ship type of the auction model
export enum ShipType {
    WORLDWIDE = "worldwide",
    COUNTRY = "country",
    EVENT = "event",
    DIGITAL = "digital",
}

// platform type of the auction model
export enum PlatformType {
    EMAIL = "email",
    INSTAGRAM = "instagram",
    WHATSAPP = "whatsapp",
    MESSENGER = "messenger",
    SNAPCHAT = "snapchat",
    TWITTER = "twitter",
    NONE = "none",
}

// scheduler type of the auction model
export enum SchedulerType {
    HELP = "help",
    AUCTION_STARTS = "auction-starts",
    AUCTION_ENDS = "auction-ends",
    DAILY_UPDATE = "daily-update",
    GENERATE_CHECKOUT_URL = "generate-checkout-url",
    MOVE_TO_NEXT_BIDDER = "move-to-next-bidder",
    REMINDER = "reminder",
    PRIZE_DELIVERED = "prize-delivered",
    PAYOUT_EXECUTE = "payout-execute",
}

// Auction
export interface Destination {
    location: string;
    deliveryFee: number;
}

export interface Social {
    platform: PlatformType;
    platformId: string;
}

export interface PrizeDate {
    month: number;
    year: number;
}

// Bidder
export interface Address {
    city?: string;
    country: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
}

// an idea object
export interface IdeaType {
    title: string;
    description: string;
}

// events for socket.io
export const socketEvents = {
    loves: "loves",
    bid: "bid",
    reply: "reply",
};

// predefined currencies for the currencies endpoint
interface Currency {
    symbol: string;
    acronym: string;
    fullname: string;
    value: string;
}

export const currencies: Currency[] = [
    {
        symbol: "$",
        acronym: "USD",
        fullname: "United States Dollar",
        value: "usd",
    },
    {
        symbol: "€",
        acronym: "EUR",
        fullname: "Euro",
        value: "eur",
    },
    {
        symbol: "£",
        acronym: "GBP",
        fullname: "British Pound",
        value: "gbp",
    },
    {
        symbol: "C$",
        acronym: "CAD",
        fullname: "Canadian Dollar",
        value: "cad",
    },
    {
        symbol: "A$",
        acronym: "AUD",
        fullname: "Australian Dollar",
        value: "aud",
    },
    {
        symbol: "kr",
        acronym: "DKK",
        fullname: "Danish Krone",
        value: "dkk",
    },
    {
        symbol: "kr",
        acronym: "NOK",
        fullname: "Norwegian Krone",
        value: "nok",
    },
    {
        symbol: "kr",
        acronym: "SEK",
        fullname: "Swedish Krona",
        value: "sek",
    },
    {
        symbol: "HK$",
        acronym: "HKD",
        fullname: "Hong Kong Dollar",
        value: "hkd",
    },
    {
        symbol: "S$",
        acronym: "SGD",
        fullname: "Singapore Dollar",
        value: "sgd",
    },
    {
        symbol: "NZ$",
        acronym: "NZD",
        fullname: "New Zealand Dollar",
        value: "nzd",
    },
    {
        symbol: "Kč",
        acronym: "CZK",
        fullname: "Czech Koruna",
        value: "czk",
    },
    {
        symbol: "Ft",
        acronym: "HUF",
        fullname: "Hungarian Forint",
        value: "huf",
    },
    {
        symbol: "zł",
        acronym: "PLN",
        fullname: "Polish Złoty",
        value: "pln",
    },
    {
        symbol: "$",
        acronym: "MXN",
        fullname: "Mexican Peso",
        value: "mxn",
    },
    {
        symbol: "R$",
        acronym: "BRL",
        fullname: "Brazilian Real",
        value: "brl",
    },
];

export const ErrorMessage = {
    AWS_ACCESS_KEY_ID_not_found: "AWS_ACCESS_KEY_ID config not found",
    AWS_REGION_is_empty: "AWS_REGION is empty",
    AWS_SECRET_ACCESS_KEY_not_found: "AWS_SECRET_ACCESS_KEY config not found.",
    token_not_found: "unauthorized access: token not found.",
    token_expired: "Hmm... That token is expired!",
    code_expired: "Oh sloth balls! That code is wrong or expired!, request a new one.",
    creator_not_found_or_not_logged_in: "Hmm... somethings gone wrong. We can't find the creator. Log in again.",
    creator_deactivated: "Oh sloth balls, that account’s been deactivated.",
    creator_email_not_verified: "Wait, that email isn’t verified.",
    creator_email_already_verified: "Wait! That email's already verified!",
    creator_not_authorized: "creator-not-authorized.",
    creator_not_found: "Hmm... we can’t find the creator!",
    bidder_not_found: "Hmm... we can’t find the bidder!",
    old_password_wrong: "Sloth balls! That old password isn't right!",
    // creator_not_found: "Either you’re a sloth ghost, or we can’t find you!",

    email_taken: "Sloth balls! That email is taken!",
    username_taken: "Sloth balls! That username is taken!",
    wrong_email_or_password: "Sloth balls! Wrong email or password!",

    draft_not_found: "Hmm.. We can't find that draft",
    auction_not_found: "Hmm... we can’t find that auction!",
    auction_failed: "Sadly, Auction Failed!",
    scheduler_not_found: "Hmm... we can’t find that scheduler!",
    need_username: "Oh sloth balls, someone’s username is missing!",
    live_auction_not_found: "Oh sloth balls, we can’t find that live auction!",
    auction_creation_failed: "Oh sloth balls, something went wrong when creating the auction! Try again.",
    past_dates: "Start Date and End Date must be Future Dates",
    auction_ongoing: "Wait, slow it down like a sloth! Your last auction is still going.",
    prize_already_delivered: "Wait, you’re all good, that prize has already been delivered.",
    prize_deliver_failed: "Oh sloth balls, something went wrong when delivering the prize! Try again.",
    latest_auction_not_complete: "Wait, you’ve gotta deliver the treasure on your last auction!",
    auction_expired: "The sloth slumber party is over! That auction is finished. Or... maybe not started yet!",
    outside_of_auction_time: "Party has not started yet or Party is over!",
    avatar_not_uploaded: "Wait, profile pic is needed! Cheeeeese!",
    launch_auction_failed: "Oh sloth balls, we messed up! Something’s gone wrong when launching auction.",

    stripe_not_fully_connected: "Heads up, Stripe has not been fully connected!",
    stripe_fully_connected: "Relax like a sloth! You’re stripe is already connected.",
    stripe_not_connected_at_all: "Wait, you need to connect to Stripe",
    // stripe_account_not_fully_connected: "Wait, almost there, but your Stripe isn’t fully connected!",

    bid_gt_start_price: "You gotta bid more! Match the start price!",
    bid_gt_top_amount: "You gotta bid more! Beat the top bidder with bid increments!",
    bid_own_auction: "GASP! You can’t bid on your own auction, that’s cheating!",
    bid_top_bidder: "Sit back, relax, you’re currently the top bidder champ!",
    bidder_email_verify_failed: "Oh sloth balls, that’s not right. invalid or expired token code or wrong bidder email",
    top_bidder_not_found: "Hmm... we can’t find the top bidder!",
    bidding_failed: "Oh sloth balls, something went wrong. Don’t worry, bid again!",
    auction_update_failed: "Oh sloth balls, something went wrong! We can’t update the auction with new attributes!",
    invite_code_not_found: "Wrong or Expired code! Wait… Are you trying to crash the party?",
    invite_code_exists: "Invite code already exists!",
    bid_not_found: "Hmm... we cannot find the bid!",
    // bid_not_found: "Oh sloth balls, something’s gone wrong! Try again!",
    payment_status_updating_failed: "payment status updating failed",
    winner_not_found: "winner of the current auction not found",
    winning_bid_not_found: "Winning Bid Not Found",
};
