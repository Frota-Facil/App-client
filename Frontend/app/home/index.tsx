import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Header } from '../../components/layout/Hearder';
import { TabBar } from '../../components/layout/TabBar';
import { AlertCard } from '../../components/cards/AlertCard';
import { VehicleCard } from '../../components/cards/VehicleCard';

import { vehicles } from '../../constants/data';
import { styles } from '../../styles/globalStyles';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <Header />

      <ScrollView style={styles.body}>
        <AlertCard
          icon={<Text>📋</Text>}
          title="1 solicitação pendente"
          subtitle="Acompanhe o status"
          tint="#FEF3E2"
        />

        <AlertCard
          icon={<Text>🔔</Text>}
          title="2 notificações"
          subtitle="Toque para ver"
          tint="#EDF2F7"
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Veículos recentes</Text>
        </View>

        {vehicles.map((v) => (
          <VehicleCard key={v.id} {...v} />
          
        ))}
        
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}