import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex flex-col w-full h-full gap-2 p-2 border border-border">
      <View className="flex flex-1 w-full h-full">
        <Text className="text-primary">Section 1</Text>
      </View>
      <View className="flex flex-1 w-full h-full">
        <Text className="text-primary">Section 2</Text>
      </View>
      <View className="flex flex-1 w-full h-full">
        <Text className="text-primary">Section 3</Text>
      </View>
    </SafeAreaView>
  );
}
