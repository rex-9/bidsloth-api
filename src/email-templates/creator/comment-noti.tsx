import { DefaultLayout } from "../components";
import { Text, Section, Link } from "@react-email/components";

interface EmailProp {
    username: string;
    comment: string;
    link: string;
}

export default function Email({ username, comment, link }: EmailProp) {
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
                    marginBottom: "50px",
                }}
            >
                <Text
                    style={{
                        fontSize: "24px",
                        fontWeight: 600,
                        lineHeight: "normal",
                    }}
                >
                    Eeee! Comment!
                </Text>

                <Text>
                    {username}, a bidder has commented on your auction!
                    <br />
                    They said:
                </Text>

                <Text
                    style={{
                        borderRadius: "16px 16px 16px 0px",
                        border: "1px solid #F06",
                        background: "#FFF2F7",
                        width: "fit-content",
                        padding: "15px 50px",
                        fontStyle: "italic",
                        lineHeight: "185.5%",
                        margin: "0 auto",
                    }}
                >
                    {comment}
                </Text>

                <br />
                <br />

                <Link
                    href={link}
                    style={{
                        borderRadius: "10px",
                        background: "#F06",
                        padding: "15px 20px",
                        color: "#FFF",
                        fontSize: "16px",
                    }}
                >
                    Respond
                </Link>
            </Section>
        </DefaultLayout>
    );
}
