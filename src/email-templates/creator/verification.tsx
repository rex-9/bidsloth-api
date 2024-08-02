import { DefaultLayout } from "../components";
import { Text, Container, Section, Img } from "@react-email/components";

import images from "@/utilities/images";
const { defaultImg } = images;

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
                    Here you go
                </Text>

                <Text>Psst.. Another top secret code:</Text>

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

                <Text>Pop it in!</Text>

                <Container style={{ padding: "10px 0" }}>
                    <Img style={{ margin: "0 auto" }} src={defaultImg?.url} alt={defaultImg?.label} height={240} />
                </Container>

                <Text>May the sloth be with you</Text>
            </Section>
        </DefaultLayout>
    );
}
