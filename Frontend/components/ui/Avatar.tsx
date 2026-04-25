import { View, Text } from 'react-native'
import { styles } from '../../styles/globalStyles'

type AvatarProps = {
  initials: string
}

export const Avatar = ({ initials }: AvatarProps) => (
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>{initials}</Text>
  </View>
)