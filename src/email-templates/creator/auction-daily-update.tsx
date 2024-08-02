import { DefaultLayout } from "../components";
import { Text, Img, Container, Section, Column } from "@react-email/components";

interface EmailProp {
    username: string;
    photo: string;
    topBid: number;
    bidCount: number;
    commentCount: number;
    countDown:
        | number
        | {
              days: number;
              hours: number;
              mins: number;
              secs: number;
          };
}

export default function Email({ username, photo, topBid, bidCount, commentCount, countDown }: EmailProp) {
    return (
        <DefaultLayout>
            <Section
                style={{
                    padding: "16px 16px 0px 16px",
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
                        fontWeight: 600,
                        lineHeight: "normal",
                    }}
                >
                    Auction Update!
                </Text>

                <Text>{username} here’s your daily update on your auction!</Text>

                <Container
                    style={{
                        padding: "20px 0",
                    }}
                >
                    <Column>
                        <Img src={photo} alt="Auction Photo" style={{ margin: "0 auto", objectFit: "contain" }} height={250} />
                    </Column>
                    <Column style={{ padding: "0 10px" }}>
                        <Text>
                            Current Top Bid: <br />
                            <span
                                style={{
                                    color: "#FF0066",
                                }}
                            >
                                ${topBid}
                            </span>
                        </Text>
                        <Text>
                            Bid Count: <br />
                            <span
                                style={{
                                    color: "#FF0066",
                                }}
                            >
                                {bidCount}
                            </span>
                        </Text>
                        <Text>
                            Comment Count: <br />
                            <span
                                style={{
                                    color: "#FF0066",
                                }}
                            >
                                {commentCount}
                            </span>
                        </Text>
                    </Column>
                </Container>

                {countDown !== 0 && typeof countDown === "object" && (
                    <Text>
                        Auction ends in:{" "}
                        <span style={{ color: "#FF0066" }}>
                            {countDown.days} days {countDown.hours} hrs {countDown.mins} mins
                        </span>
                    </Text>
                )}

                <Text>
                    Keep on sharing! <br />
                    Keep the bidding frenzy going!
                </Text>
            </Section>
        </DefaultLayout>
    );
}
