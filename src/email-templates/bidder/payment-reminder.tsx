import { DefaultLayout } from "../components";
import { Text, Container, Column, Section, Img, Link } from "@react-email/components";

import images from "@/utilities/images";
const { winningImg } = images;
interface EmailProp {
    username: string;
    auction: {
        photo: string;
        title: string;
        creator: string;
    };
    bidAmount: number;
    paymentLink: string;
    hoursLeft: number;
    deliveryFee: number;
    avatar: string;
}

export default function Email({ auction, bidAmount, paymentLink, hoursLeft, deliveryFee, avatar }: EmailProp) {
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
                    CLAIM YOUR PRIZE!
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
                            We’re still waiting for your payment!
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

                <Text
                    style={{
                        fontSize: "16px",
                        paddingTop: "10px",
                        fontWeight: 600,
                        lineHeight: "normal",
                    }}
                >
                    PAY NOW AND CLAIM YOUR PRIZE!
                </Text>

                <br />

                <Link
                    href={paymentLink}
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
                    Pay Now
                </Link>

                <br />
                <br />

                {hoursLeft === 24 && (
                    <Text>
                        The clock is ticking! <br />
                        If we don’t receive payment by the time the clock runs out, <br />
                        the prize will go to the next placed bidder!
                    </Text>
                )}

                {hoursLeft === 8 && (
                    <Text>
                        Tick.. Tock.. Tick... Tock... <br />
                        If we don’t receive payment by the time the clock runs out, <br />
                        the prize will go to the next placed bidder!
                    </Text>
                )}
                {hoursLeft === 1 && (
                    <Text>
                        Last chance! <br />
                        If we don’t receive payment by the time the clock runs out, <br />
                        the prize will go to the next placed bidder!{" "}
                    </Text>
                )}
                <Text style={{ marginTop: "20px" }}>TIME LEFT TO PAY!</Text>

                <Text
                    style={{
                        color: "#F06",
                        fontSize: "30px",
                        fontWeight: "600",
                        lineHeight: "20px",
                        borderRadius: "5px",
                        border: "1px dashed #F06",
                        width: "fit-content",
                        padding: "20px 20px 15px 20px",
                        margin: "0 auto",
                    }}
                >
                    {hoursLeft - 1} &nbsp; 59 &nbsp; 59 <br />
                    <span
                        style={{
                            color: "black",
                            fontSize: "12px",
                        }}
                    >
                        Hours &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Mins &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Secs
                    </span>
                </Text>

                <Text
                    style={{
                        fontSize: "16px",
                        paddingTop: "10px",
                        fontWeight: 600,
                        lineHeight: "normal",
                    }}
                >
                    YOUR WINNING BID!
                </Text>

                <Container>
                    <Column style={{ width: "50vw" }}>
                        <Text>
                            FINAL BID PRIZE: <br />
                            <span style={{ color: "#FF0066" }}>${bidAmount}</span>
                        </Text>
                        +${deliveryFee}
                        <Text>
                            Total to Pay: <br />
                            <span style={{ color: "#FF0066" }}>${bidAmount + deliveryFee}</span>
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
            </Section>
        </DefaultLayout>
    );
}
