import { Html, Text, Container, Section, Font, Head, Column, Hr, Img, Link } from "@react-email/components";
import images from "@/utilities/images";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { backLogo, redLogo, linkedInIcon, twitterIcon, watermark, instagramIcon } = images;
    return (
        <Html lang="en">
            {/* Header Config */}
            <Head>
                <Font
                    fontFamily="Poppins"
                    fallbackFontFamily={["Verdana", "Helvetica"]}
                    webFont={{
                        format: "woff2",
                        url: "https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2",
                    }}
                />
            </Head>

            <Section style={{ background: "#f8fafc" }}>
                {/* Mail Content */}
                <Container
                    style={{
                        marginTop: 20,
                        marginBottom: 20,
                        display: "table",
                        margin: "0 auto",
                    }}
                >
                    <Img style={{ margin: "0 auto" }} height={80} src={redLogo?.url} alt={redLogo?.label} />

                    {/* Content goes here */}
                    {children}

                    <Hr />

                    <Img
                        style={{
                            margin: "0 auto",
                            paddingTop: "24px",
                        }}
                        height={20}
                        src={watermark?.url}
                    />

                    <Section style={{ paddingTop: 24 }}>
                        <Column style={{ width: "25vw" }}>
                            <Link href="https://bidsloth.com/" target="_blank">
                                <Img style={{ margin: "0 auto" }} height={20} alt={backLogo?.label} src={backLogo?.url} />
                            </Link>
                        </Column>
                        <Column style={{ width: "25vw" }}>
                            <Link href="https://twitter.com/bidsloth" target="_blank">
                                <Img style={{ margin: "0 auto" }} height={20} alt={twitterIcon?.label} src={twitterIcon?.url} />
                            </Link>
                        </Column>
                        <Column style={{ width: "25vw" }}>
                            <Link href="https://www.instagram.com/bidsloth/" target="_blank">
                                <Img style={{ margin: "0 auto" }} height={20} alt={instagramIcon?.label} src={instagramIcon?.url} />
                            </Link>
                        </Column>
                        <Column style={{ width: "25vw" }}>
                            <Link href="https://www.linkedin.com/company/bidsloth/" target="_blank">
                                <Img style={{ margin: "0 auto" }} height={20} alt={linkedInIcon?.label} src={linkedInIcon?.url} />
                            </Link>
                        </Column>
                    </Section>

                    <Text
                        style={{
                            paddingTop: 12,
                            color: "#C1C1C1",
                            textAlign: "center",
                            fontSize: "10px",
                            fontStyle: "normal",
                            fontWeight: "400",
                        }}
                    >
                        &copy; {new Date().getFullYear()} Bidsloth LTD. Sheffield. United Kingdom.
                    </Text>

                    <Text
                        style={{
                            color: "#C1C1C1",
                            textAlign: "center",
                            fontSize: "10px",
                            fontStyle: "normal",
                            fontWeight: "400",
                        }}
                    >
                        <Link href="mailto:help@bidsloth.com">Contact Us</Link> • <Link href="https://bidsloth.com/policies/terms">Terms of Use</Link> • <Link href="https://bidsloth.com/policies/privacy">Privacy Policy</Link>{" "}
                    </Text>
                </Container>
            </Section>
        </Html>
    );
}
