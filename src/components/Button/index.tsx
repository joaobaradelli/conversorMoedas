import { TouchableOpacity, TouchableOpacityProps, Text, ActivityIndicator, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { style } from './style'

interface ButtonProps extends TouchableOpacityProps {

    title: string
    isLoading?: boolean
    icon: keyof typeof Ionicons.glyphMap
}

export function Button({ title, isLoading = false, icon, ...rest }: ButtonProps) {
    return (
        <TouchableOpacity disabled={isLoading} activeOpacity={0.8} {...rest} style={style.container}>
            {isLoading ? (
                <ActivityIndicator color="white" />
            ) : (
                <>
                    <Image style={style.icon} src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-suite-everything-you-need-know-about-google-newest-0.png" />
                    <Text style={style.text}>{title}</Text>
                </>
            )}



        </TouchableOpacity>
    )
}
