import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const googleOAuth = useOAuth({ strategy: "oauth_google" });

    async function onGoogleSignIn() {
        try {
            setIsLoading(true);

            const redirectUrl = makeRedirectUri({
                useProxy: true,
            });

            const oAuthFlow = await googleOAuth.startOAuthFlow({ redirectUrl });

            if (oAuthFlow?.authSessionResult?.type === "success") {
                if (oAuthFlow.setActive) {
                    await oAuthFlow.setActive({ session: oAuthFlow.createdSessionId });
                }
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (Platform.OS !== 'web') {
            WebBrowser.warmUpAsync();
            return () => { WebBrowser.coolDownAsync(); };
        }
    }, []);

    return (
        <View style={styles.screen}>
            <Text style={styles.text}>
                Fazer Login
            </Text>
            <Button
                icon="logo-google"
                title="GOOGLE"
                onPress={onGoogleSignIn}
                isLoading={isLoading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    text: {
        fontSize: 22,
        fontWeight: '700',
    },
});
