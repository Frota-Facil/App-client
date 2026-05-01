import React from "react";
import { ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from "../../styles/globalStyles";
import { TabBar } from "../../components/layout/TabBar";
import { RequestCard } from "../../components/cards/RequestCard";
import { requests } from "../../constants/requests";
import { FormButton } from "../../components/ui/FormButton";
import { router } from "expo-router";

export default function SolicitaçõesScreen() {
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      
      
      {/* HEADER SIMPLES */}
      <View
        style={{
          padding: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          marginBottom: 20,
        }}
      >
        <View style={{flex:1, flexDirection:"row", alignItems: "center", gap:10}}>
          <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={require("../../assets/images/seta-esquerda.png")}
                style={styles.backIcon}
              />
          </TouchableOpacity>

          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Minhas solicitações
          </Text>
        </View>

        <FormButton
          title="+"
          onPress={() => router.push("/addrequest")}
          variant="primary"
        />
      </View>

      {/* FILTROS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40}}>
        <View style={{ flexDirection: "row", paddingHorizontal: 10, height: 40, }}>
          {["Todas", "Pendentes", "Aprovadas", "Recusadas"].map((item) => (
            <TouchableOpacity
              key={item}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                backgroundColor: "#E5E7EB",
                borderRadius: 20,
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 12 }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* LISTA */}
      <ScrollView style={styles.body}>
        {requests.map((item) => (
          <RequestCard key={item.id} {...item} />
        ))}
      </ScrollView>

      <TabBar />
     
    </SafeAreaView>
  );
}