import { DefaultLayout } from "../components";
import { Text, Container, Column, Img, Section } from "@react-email/components";

import images from "@/utilities/images";
const { winningImg } = images;

interface EmailProp {
    username: string;
    bidderName: string;
    wonAmount: number;
    deliveryFee: number;
    place: string;
}

export default function Email({ bidderName, wonAmount, deliveryFee, place }: EmailProp) {
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
                    Onto {place} place!
                </Text>

                <Text>
                    Oh sloth balls, we didn’t receive payment <br />
                    from the first placed bidder, so we have had <br />
                    to move onto the {place} place bidder!
                </Text>

                <Text
                    style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        lineHeight: "normal",
                    }}
                >
                    THE NEW WINNING BID!
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
                        <Img src={winningImg?.url} alt={winningImg?.label} style={{ margin: "0 auto", objectFit: "contain" }} height={200} />
                    </Column>
                </Container>

                <Text>
                    The new winner will have 48 hours to pay. <br />
                    We’ll email you as soon as they pay! <br /> <br />
                    If we don’t receive payment in time from them we’ll move onto the <br /> 3rd place bidder!
                </Text>
            </Section>
        </DefaultLayout>
    );
}
