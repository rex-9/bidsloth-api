import { DefaultLayout } from "./components";
import { Text, Link, Section } from "@react-email/components";

interface EmailProp {
    username: string | undefined;
    resetLink: string;
}

export default function Email({ resetLink }: EmailProp) {
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
                    Password Reset
                </Text>

                <br />

                <Link
                    href={resetLink}
                    style={{
                        width: "275px",
                        height: "45px",
                        borderRadius: "10px",
                        background: "#F06",
                        padding: "15px 20px",
                        color: "#FFF",
                        fontSize: "16px",
                        fontWeight: "600",
                    }}
                >
                    Reset my Password
                </Link>

                <br />
                <br />

                <Text>
                    Oh sloth balls! Forgotten your password? <br />
                    Don’t worry it happens to all of us! <br />
                    Just click the button below to set a new password.
                </Text>

                <Text>
                    If you didn’t request a password reset, ignore this email and <br />
                    the link will expire on it’s own.
                </Text>
            </Section>
        </DefaultLayout>
    );
}
