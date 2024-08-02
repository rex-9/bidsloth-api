import { DefaultLayout } from "../components";
import { Text, Container, Section, Img, Column, Link } from "@react-email/components";

import images from "@/utilities/images";
const { winningImg } = images;

interface EmailProp {
    username: string;
    auction: {
        photo: string;
        title: string;
        creator: string;
    };
    confirmLink: string;
    avatar: string;
}

export default function Email({ auction, confirmLink, avatar }: EmailProp) {
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
                    Just checking if you received the prize.
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
                            Holy sloth! It has been 2 days! Did you receive the prize!
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

                <Container>
                    {/* <Column style={{ width: "50vw" }}> */}
                    <Img
                        src={winningImg?.url}
                        alt={winningImg?.label}
                        style={{
                            margin: "0 auto",
                            objectFit: "contain",
                        }}
                        height={200}
                    />
                    {/* </Column> */}
                </Container>

                <Text
                    style={{
                        fontSize: "16px",
                        paddingTop: "10px",
                        fontWeight: 600,
                        lineHeight: "normal",
                    }}
                >
                    Click CONFIRM when you receive the Prize you deserve!
                </Text>
                <br />
                <Link
                    href={confirmLink}
                    style={{
                        width: "275px",
                        height: "45px",
                        padding: "15px 20px",
                        borderRadius: "10px",
                        background: "#F06",
                        color: "#FFF",
                        fontSize: "16px",
                        fontWeight: "600",
                    }}
                >
                    CONFIRM
                </Link>
                <br />
                <br />

                <Text>
                    The creator you love has delivered the prize! <br />
                    Please don't forget to click the above CONFIRM button when you received it! <br />
                </Text>
            </Section>
        </DefaultLayout>
    );
}
