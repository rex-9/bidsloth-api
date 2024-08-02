import { DefaultLayout } from "../components";
import { Text, Column, Container, Section, Img, Link } from "@react-email/components";

import images from "@/utilities/images";
const { waitingImg } = images;

interface EmailProp {
    username: string;
    auction: {
        photo: string;
        title: string;
        creator: string;
    };
    bidAmount: number;
    countDown:
        | number
        | {
              days: number;
              hours: number;
              mins: number;
              secs: number;
          };
    thankMessage: string;
    auctionLink: string;
    avatar: string;
}

export default function Email({ auction, bidAmount, countDown, thankMessage, auctionLink, avatar }: EmailProp) {
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
                    Your Bid is Placed!
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
                            Congrats! You’re the top bidder on...
                            <br />
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

                <Text style={{ fontSize: "16px", paddingTop: "5px" }}>BID SUMMARY</Text>

                <Container style={{ fontSize: "12px" }}>
                    <Column style={{ width: "50vw" }}>
                        <Text>
                            YOUR BID PRIZE: <br />
                            <span style={{ color: "#FF0066" }}>${bidAmount}</span>
                        </Text>
                        {typeof countDown === "object" && (
                            <Text>
                                AUCTION ENDS IN: <br />
                                <span style={{ color: "#FF0066" }}>
                                    {countDown.days} days {countDown.hours} hrs {countDown.mins} mins
                                </span>
                            </Text>
                        )}
                    </Column>
                    <Column style={{ width: "50vw" }}>
                        <Img src={waitingImg?.url} alt={waitingImg?.label} style={{ margin: "0 auto", objectFit: "contain" }} height={120} />
                    </Column>
                </Container>

                <br />

                <Link
                    href={auctionLink}
                    style={{
                        width: "275px",
                        height: "45px",
                        borderRadius: "10px",
                        background: "#F06",
                        padding: "15px 20px",
                        color: "#FFF",
                        fontSize: "16px",
                        fontWeight: "600",
                    }}
                >
                    Go to Auction
                </Link>

                <br />
                <br />

                <Text style={{ fontSize: "16px" }}>Keep an Eye on your Inbox</Text>

                <Text>
                    We will have news for you! <br />
                    Either you’ll get outbid or, sloth toes crossed, YOU WIN! <br /> <br />
                    Oh, yes and here’s your bidding message <br /> straight from the creator so you can treasure it forever & ever!
                </Text>

                <Container style={{ margin: "0 auto" }}>
                    <Container style={{ width: "fit-content" }}>
                        <Column style={{ position: "relative", width: 42 }}>
                            <Img
                                src={avatar}
                                alt="Creator Avatar"
                                style={{
                                    margin: "0 auto",
                                    objectFit: "contain",
                                    borderRadius: "50%",
                                    position: "absolute",
                                    bottom: 0,
                                }}
                                height={35}
                            />
                        </Column>
                        <Column>
                            <Text
                                style={{
                                    borderRadius: "16px 16px 16px 0px",
                                    border: "1px solid #F06",
                                    background: "#FFF2F7",
                                    width: "fit-content",
                                    padding: "15px 50px",
                                    fontStyle: "italic",
                                    lineHeight: "185.5%",
                                    margin: "0 auto",
                                }}
                            >
                                {thankMessage}
                            </Text>
                        </Column>
                    </Container>
                </Container>

                <Text>
                    Remember to channel your inner sloth and you'll crush it! <br />
                    Like the sloth crushes leaves. You got this!
                </Text>
            </Section>
        </DefaultLayout>
    );
}
