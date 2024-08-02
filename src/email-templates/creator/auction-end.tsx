import { DefaultLayout } from "../components";
import { Text, Container, Column, Img, Section } from "@react-email/components";

import images from "@/utilities/images";
const { winningImg } = images;
interface EmailProp {
    username: string;
    bidderName: string;
    wonAmount: number;
    deliveryFee: number;
}

export default function Email({ username, bidderName, wonAmount, deliveryFee }: EmailProp) {
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
                        fontWeight: 800,
                        lineHeight: "normal",
                    }}
                >
                    CONGRATULATIONS!
                </Text>

                <Text>{username}, Your auction has finished!</Text>

                <Text
                    style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        lineHeight: "normal",
                    }}
                >
                    THE WINNING BID!
                </Text>

                <Container>
                    <Column style={{ width: "50vw" }}>
                        <Text>
                            FINAL BID PRIZE: <br />
                            <span style={{ color: "#FF0066" }}>${wonAmount}</span>
                        </Text>
                        +${deliveryFee}
                        <Text>
                            Total to Pay: <br />
                            <span style={{ color: "#FF0066" }}>${wonAmount + deliveryFee}</span>
                        </Text>
                        <Text>
                            Winner: <br />
                            <span style={{ color: "#FF0066" }}>{bidderName}</span>
                        </Text>
                    </Column>
                    <Column style={{ width: "50vw" }}>
                        <Img
                            src={winningImg?.url}
                            alt={winningImg?.label}
                            style={{
                                margin: "0 auto",
                                objectFit: "contain",
                            }}
                            height={200}
                        />
                    </Column>
                </Container>

                <Text>
                    The winner will have 48 hours to pay. <br />
                    We’ll email you as soon as they pay! <br /> <br />
                    If we don’t receive payment in time, <br /> we’ll move onto the second placed bidder!
                </Text>
            </Section>
        </DefaultLayout>
    );
}
