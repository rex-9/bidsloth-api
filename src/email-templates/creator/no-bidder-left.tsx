import { DefaultLayout } from "../components";
import { Text, Section, Link } from "@react-email/components";

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
                    Oh sloth balls
                </Text>
            </Section>
            <Text style={{ textAlign: "start" }}>
                <Text>Hey {username},</Text>
                <Text>Unfortunately we have some not so good news.</Text>
                <Text>This time round, none of the bidders paid up. We tried them all, down to the very last bidder but no one paid for the prize.</Text>
                <Text>We know it's disappointing! Sometimes things just don't go as planned.</Text>
                <Text>But try not to let this discourage you! We’re confident if you gave it another go, your next auction might be a hit.</Text>
                <Text>
                    If you have any questions or need any assistance, feel free to reach out - <Link href="mailto:help@bidsloth.com">help@bidsloth.com</Link>
                </Text>
                <Text>We're here to help you every step of the way.</Text>
                <Text>May the sloth be with you.</Text>
            </Text>
        </DefaultLayout>
    );
}
