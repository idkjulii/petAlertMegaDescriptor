// app/report/[id].jsx
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ReportDetail() {
  const { id } = useLocalSearchParams();
  return (
    <View style={{ padding: 16 }}>
      <Text>Detalle del reporte: {String(id)}</Text>
    </View>
  );
}

