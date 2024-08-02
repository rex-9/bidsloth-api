import { DefaultLayout } from "./components";
import { Text, Container, Section, Img, Link } from "@react-email/components";

import images from "@/utilities/images";
const { welcomeImg } = images;

interface EmailProp {
    username: string | undefined;
    verificationCode: string;
}

export default function Email({ verificationCode }: EmailProp) {
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
                    Ahhhh-eeee!
                </Text>

                <Text
                    style={{
                        fontStyle: "italic",
                        fontWeight: "500",
                    }}
                >
                    (That’s hello in sloth)
                </Text>

                <Text>Here’s your TOP SECRET verification code:</Text>

                <Text
                    style={{
                        color: "#F06",
                        fontSize: "30px",
                        fontWeight: "600",
                        lineHeight: "50px",
                        letterSpacing: "15px",
                        borderRadius: "5px",
                        border: "1px dashed #F06",
                        width: "fit-content",
                        padding: "0 20px 0 40px",
                        margin: "0 auto",
                    }}
                >
                    {verificationCode}
                </Text>

                <Text>
                    Pop it in! <br />
                    And then you’re just one step away from starting a bidding frenzy!
                </Text>

                <Container style={{ padding: "10px 0" }}>
                    <Img style={{ margin: "0 auto" }} src={welcomeImg?.url} alt={welcomeImg?.label} height={240} />
                </Container>

                <Text
                    style={{
                        textAlign: "center",
                        fontSize: "20px",
                        fontWeight: 600,
                        margin: "25px 0",
                    }}
                >
                    A quick hello from the Chief Sloth!
                </Text>
                <Text style={{ textAlign: "start", padding: "0 15px" }}>
                    <Text>Howdy I’m Daniel,</Text>
                    <Text>Founder and chief sloth. We’re super excited you’re here and cannot wait to see what you auction!</Text>
                    <Text>Bidsloth is all about creators, and we’re just getting started on this journey. So please feel free to connect with us, tell us your thoughts or ask any questions!</Text>
                    <Text>
                        <Link href="mailto:daniel@bidsloth.com">You can email me directly</Link>, <Link href="https://twitter.com/bidsloth">drop us a tweet</Link>, or <Link href="https://discord.gg/eBpYTuRqTW">join our slothy discord!</Link>{" "}
                    </Text>
                    <Text>Good luck and happy auctioning!</Text>
                    <Text>May the sloth be with you,</Text>
                    Daniel
                </Text>
            </Section>
        </DefaultLayout>
    );
}
