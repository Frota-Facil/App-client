import { Image, StyleSheet, View, Text } from 'react-native'
import { normalizeImageUrl } from '../../services/imageUrl'
import { styles } from '../../styles/globalStyles'

type AvatarProps = {
  initials: string
  imageUrl?: string | null
}

export const Avatar = ({ initials, imageUrl }: AvatarProps) => {
  const normalizedImageUrl = normalizeImageUrl(imageUrl);

  return (
    <View style={styles.avatar}>
      {normalizedImageUrl ? (
        <Image
          resizeMode="cover"
          source={{ uri: normalizedImageUrl }}
          style={avatarStyles.image}
        />
      ) : (
        <Text style={styles.avatarText}>{initials}</Text>
      )}
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});
