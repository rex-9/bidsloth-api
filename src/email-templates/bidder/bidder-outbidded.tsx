import { DefaultLayout } from "../components";
import { Text, Container, Column, Section, Img, Link } from "@react-email/components";

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
    auctionLink: string;
    avatar: string;
}

export default function Email({ auction, bidAmount, countDown, auctionLink, avatar }: EmailProp) {
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
                    marginBottom: "50px",
                }}
            >
                <Text
                    style={{
                        fontSize: "24px",
                        fontWeight: 800,
                        lineHeight: "normal",
                    }}
                >
                    You've been Outbid!
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
                            Oh! Sloth balls! You’ve been outbid on... <br />
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

                <Text style={{ fontSize: "16px", textAlign: "center" }}>
                    THE TOP BID IS NOW <br />
                    <span style={{ color: "#FF0066" }}>${bidAmount}</span> <br />
                    {typeof countDown === "object" && (
                        <Text>
                            AUCTION ENDS IN: <br />
                            <span style={{ color: "#FF0066" }}>
                                {countDown.days} days {countDown.hours} hrs {countDown.mins} mins
                            </span>
                        </Text>
                    )}
                </Text>

                <Text>
                    QUICK! Bid again to get back on top & win the prize! <br />
                    It’s easy to do, just click the button below!
                </Text>

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
                    Place Another Bid
                </Link>
            </Section>
        </DefaultLayout>
    );
}
