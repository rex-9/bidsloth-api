import { DefaultLayout } from "./components";
import { Text, Section, Link } from "@react-email/components";

export default function Email() {
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
                    Go-eeeeee! 😭
                </Text>

                <Text
                    style={{
                        fontStyle: "italic",
                        fontWeight: "500",
                    }}
                >
                    (That’s goodbye in sloth)
                </Text>
                <Text>
                    Your account has been deleted. <br />
                    Okay, we’re not very good at this bit. Breakups are never easy. <br />
                    But we understand, we’ll miss you! 🥹 <br />
                    Oh and hey, if you ever want to rejoin, our sloth arms are wide open! <br />
                    Your welcome back whenever! <br /> <br />
                    May the sloth be with you. <br /> <br />
                    PS - If this was a mistake, let us know <Link href="mailto:help@bidsloth.com">help@bidsloth.com</Link>
                </Text>
            </Section>
        </DefaultLayout>
    );
}
