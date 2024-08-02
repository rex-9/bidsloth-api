import { DefaultLayout } from "../components";
import { Text, Column, Container, Section, Img } from "@react-email/components";

import images from "@/utilities/images";
const { waitingImg } = images;

interface EmailProp {
    username: string;
    auction: {
        photo: string;
        title: string;
        creator: string;
    };
    avatar: string;
    bidAmount: number;
    countDown:
        | number
        | {
              days: number;
              hours: number;
              mins: number;
              secs: number;
          };
}

export default function Email({ auction, bidAmount, countDown, avatar }: EmailProp) {
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
                            Congrats! You’re back on Top... <br />
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

                <Text style={{ fontSize: "16px", color: "#FF0066" }}>Keep an Eye on your Inbox</Text>

                <Text>
                    We will have news for you! <br />
                    Either you’ll get outbid or, sloth toes crossed, YOU WIN!
                </Text>

                <Text>May the sloth be with you!</Text>
            </Section>
        </DefaultLayout>
    );
}
