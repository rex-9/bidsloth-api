import { DefaultLayout } from "../components";
import { Text, Container, Section, Img } from "@react-email/components";

interface EmailProp {
    username: string;
    photo: string;
    title: string;
    auctionLink: string;
}

export default function Email({ photo, title, auctionLink }: EmailProp) {
    const url = new URL(auctionLink);
    const modifiedUrl = url.host + url.pathname;
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
                    Woop-eeee!
                </Text>

                <Text
                    style={{
                        fontStyle: "italic",
                        fontWeight: "500",
                    }}
                >
                    (That’s sloth for WOOP! WOOP!)
                </Text>

                <Text>CONGRATS! Your auction is now live!</Text>

                <Container style={{ padding: "25px 0 0 0" }}>
                    <Img src={photo} alt="Auction Photo" style={{ margin: "0 auto", objectFit: "contain" }} width={400} height={300} />
                </Container>

                <Text
                    style={{
                        color: "#C1C1C1",
                        textAlign: "center",
                        lineHeight: "normal",
                    }}
                >
                    {title}
                </Text>

                <Text>
                    Share it with your fans! <br />
                    Just pop your link wherever your fans are
                </Text>

                <Text
                    style={{
                        color: "#F06",
                        fontSize: "30px",
                        fontWeight: "600",
                        lineHeight: "50px",
                        borderRadius: "5px",
                        border: "1px dashed #F06",
                        width: "fit-content",
                        padding: "0 20px 0 40px",
                        margin: "0 auto",
                    }}
                >
                    {modifiedUrl}
                </Text>

                <Text>Let the bidding frenzy BEGIN!</Text>
            </Section>
        </DefaultLayout>
    );
}
