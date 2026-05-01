import { View, Text } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { NotificationBadge } from '../common/NotificaionBadge';
import { styles } from '../../styles/globalStyles';
import { RequestButton } from '../../components/ui/RequestButton';

export const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Avatar initials="CM" />

          <View>
            <Text style={styles.headerSubtitle}>Olá, motorista</Text>
            <Text style={styles.headerName}>Carlos Mendes</Text>
          </View>
        </View>

        <NotificationBadge count={2} />
      </View>

      <Text style={styles.heroText}>
        Pronto para a{'\n'}próxima viagem?
      </Text>


      <RequestButton onPress={() => console.log("Solicitar veículo")} />
    </View>
  );
};