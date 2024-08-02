import { Address } from "@/utilities/constants";
import { DefaultLayout } from "../components";
import { Text, Container, Column, Section, Img } from "@react-email/components";

import images from "@/utilities/images";
const { winningImg } = images;

interface EmailProp {
    username: string;
    photo: string;
    bidderName: string;
    wonAmount: number;
    address: Address;
    deliveryFee: number;
}

export default function Email({ photo, bidderName, wonAmount, address, deliveryFee }: EmailProp) {
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
                    PAYMENT RECEIVED!
                </Text>

                <Text>
                    The winner, {bidderName}, has paid! <br />
                    The wonga will be transferred straight to you! <br />
                    Please note if this is your first time using Stripe, <br /> it can take up to 7 days to receive your first payment!
                </Text>

                <Text
                    style={{
                        fontSize: "16px",
                        fontWeight: 800,
                    }}
                >
                    It's time to Deliver the Prize!
                </Text>

                <Img src={photo} alt="Winning Prize" style={{ margin: "0 auto", objectFit: "contain" }} height={200} />

                <Text
                    style={{
                        paddingTop: "10px",
                        fontSize: "20px",
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
                            Total Paid: <br />
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

                <Container>
                    <Text
                        style={{
                            textAlign: "start",
                            width: "75%",
                            margin: "0 auto",
                        }}
                    >
                        Delivery Address for the Prize: <br />
                        Country: {address.country} <br />
                        City: {address.city} <br />
                        Line1: {address.line1} <br />
                        Line2: {address.line2 ?? ""} <br />
                        Postal Code: {address.postal_code}
                    </Text>
                </Container>
            </Section>
        </DefaultLayout>
    );
}
