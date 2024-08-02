import { DefaultLayout } from "../components";
import { Text, Container, Column, Section, Img } from "@react-email/components";

import images from "@/utilities/images";
const { twitterIcon, instagramIcon, messengerIcon, mailIcon, whatsappIcon, snapchatIcon } = images;

interface EmailProp {
    username: string;
    auction: {
        photo: string;
        title: string;
        creator: string;
    };
    bidAmount: number;
    social: {
        platform: string;
        platformId: string;
    };
    winnerMessage: string;
    winnerExtraMessage: string;
    orderNo: string;
    deliveryFee: number;
    avatar: string;
}

export default function Email({ auction, bidAmount, social, winnerMessage, winnerExtraMessage, orderNo, deliveryFee, avatar }: EmailProp) {
    return (
        <DefaultLayout>
            <Section
                style={{
                    color: "#000",
                    textAlign: "center",
                    fontSize: "12px",
                    fontStyle: "normal",
                    fontWeight: "400",
                    lineHeight: "20px",
                }}
            >
                <Text
                    style={{
                        fontSize: "24px",
                        fontWeight: 800,
                        lineHeight: "normal",
                    }}
                >
                    PAYMENT COMPLETE!
                </Text>

                <Text>The prize is now yours!</Text>

                <Text
                    style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        lineHeight: "normal",
                    }}
                >
                    ENJOY YOUR PRIZE! THANK YOU!
                </Text>

                <Container>
                    <Column style={{ width: "30vw" }}>
                        <Img src={auction.photo} alt="Winning Prize" style={{ margin: "0 auto", objectFit: "contain" }} height={120} width={120} />
                    </Column>
                    <Column
                        style={{
                            padding: "0 8px",
                            width: "70vw",
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "start",
                                letterSpacing: "-0.5px",
                                fontSize: "12px",
                            }}
                        >
                            {auction.title} <br />
                            <Container style={{ paddingTop: "5px" }}>
                                <Column>
                                    <Img
                                        src={avatar}
                                        alt="Creator Avatar"
                                        style={{
                                            margin: "0 auto",
                                            objectFit: "contain",
                                            borderRadius: "50%",
                                        }}
                                        height={30}
                                    />
                                </Column>
                                <Column> &nbsp; {auction.creator}</Column>
                            </Container>
                        </Text>
                    </Column>
                </Container>

                <Container style={{ textAlign: "start", padding: "0 10px" }}>
                    <Text>Order No.: #${orderNo}</Text>
                    <Text>
                        FINAL BID PRIZE: <br />
                        <span style={{ color: "#FF0066" }}>${bidAmount}</span>
                    </Text>
                    +${deliveryFee}
                    <Text>
                        Total to Paid: <br />
                        <span style={{ color: "#FF0066" }}>${bidAmount + deliveryFee}</span>
                    </Text>
                    <Text>Delivery details from Creator {auction.creator}:</Text>
                    <Text
                        style={{
                            borderRadius: "5px",
                            padding: "15px 20px 15px 20px",
                            border: "1px dashed #F06",
                        }}
                    >
                        {winnerMessage}
                    </Text>
                    <Text>
                        You can reach out to the creator if you have any question <br /> or want to say thanks via:
                    </Text>
                    {social.platform !== "none" && (
                        <Text style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                            {social.platform === "email" && <Img src={mailIcon?.url} alt={mailIcon?.label} style={{ objectFit: "contain" }} height={25} />}
                            {social.platform === "messenger" && <Img src={messengerIcon?.url} alt={messengerIcon?.label} style={{ objectFit: "contain" }} height={25} />}
                            {social.platform === "whatsapp" && <Img src={whatsappIcon?.url} alt={whatsappIcon?.label} style={{ objectFit: "contain" }} height={25} />}
                            {social.platform === "twitter" && <Img src={twitterIcon?.url} alt={twitterIcon?.label} style={{ objectFit: "contain" }} height={25} />}
                            {social.platform === "instagram" && <Img src={instagramIcon?.url} alt={instagramIcon?.label} style={{ objectFit: "contain" }} height={25} />}
                            {social.platform === "snapchat" && <Img src={snapchatIcon?.url} alt={snapchatIcon?.label} style={{ objectFit: "contain" }} height={25} />}
                            <Text>{social.platformId}</Text>
                        </Text>
                    )}
                    <Text>Creator {auction.creator} has said, when reaching out to:</Text>
                    <Text
                        style={{
                            borderRadius: "5px",
                            padding: "15px 20px 15px 20px",
                            border: "1px dashed #F06",
                        }}
                    >
                        {winnerExtraMessage}
                    </Text>
                </Container>

                <Text>
                    Any problems, our sloths can help, <br />
                    email us: help@bidsloth.com
                </Text>
            </Section>
        </DefaultLayout>
    );
}
