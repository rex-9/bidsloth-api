import { DefaultLayout } from "../components";
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
                        fontSize: "30px",
                        fontWeight: 600,
                        lineHeight: "normal",
                    }}
                >
                    Out of time
                </Text>
            </Section>
            <Text style={{ textAlign: "start" }}>
                <Text>Unfortunately we didn’t receive your payment in time!</Text>
                <Text>That means the prize is no longer yours, and we have now moved onto to the next placed bidder.</Text>
                <Text>
                    If there’s been an issue let us know - <Link href="mailto:help@bidsloth.com">help@bidsloth.com</Link>
                </Text>
                <Text>May the sloth be with you.</Text>
            </Text>
        </DefaultLayout>
    );
}
