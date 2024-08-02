import { DefaultLayout } from "./components";
import { Text, Container, Section, Img, Link } from "@react-email/components";

import images from "@/utilities/images";
const { memeImg } = images;

interface EmailProp {
    username: string | undefined;
}

export default function Email({ username }: EmailProp) {
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
                    Sloths at your service
                </Text>

                <Text style={{ textAlign: "start" }}>
                    <Text>Hey {username},</Text>
                    <Text>Daniel here again, Founder & Chief Sloth. 🦥</Text>

                    <Text>Just swingin’ by. I saw you signed up a few days ago. How's it going?</Text>
                    <Text>If you need any support or a dose of inspiration, we're more than happy to help you get your auction started.</Text>
                    <Text>
                        Feel free to
                        <Link href="mailto:daniel@bidsloth.com">send me an email</Link> or
                        <Link href="https://discord.gg/eBpYTuRqTW">join our Discord</Link>. We could do a quick brainstorm and try bring out the best ideas!
                    </Text>
                    <Container style={{ padding: "10px 0" }}>
                        <Img style={{ margin: "0 auto" }} src={memeImg?.url} alt={memeImg?.label} height={240} />
                    </Container>

                    <Text>May the sloth be with you,</Text>
                    <Text>Daniel</Text>
                </Text>
            </Section>
        </DefaultLayout>
    );
}
