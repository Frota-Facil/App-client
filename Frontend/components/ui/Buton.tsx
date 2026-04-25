import { TouchableOpacity, Text } from 'react-native'
import { styles } from '../../styles/globalStyles'
import { ReactNode } from 'react'

type ButtonProps = {
  title: string
  onPress: () => void
  icon?: ReactNode
}

export const Button = ({ title, onPress, icon }: ButtonProps) => {
  return (
    <TouchableOpacity style={styles.ctaButton} onPress={onPress}>
      {icon}
      <Text style={styles.ctaText}>{title}</Text>
    </TouchableOpacity>
  )
}