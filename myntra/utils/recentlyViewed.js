import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveRecentlyViewed = async (product) => {
  try {
    const data = await AsyncStorage.getItem("recentProducts");
    let list = data ? JSON.parse(data) : [];

    list = list.filter((item) => item.id !== product.id);
    list.unshift(product);

    if (list.length > 10) {
      list = list.slice(0, 10);
    }

    await AsyncStorage.setItem("recentProducts", JSON.stringify(list));
  } catch (e) {
    console.log("Error saving recent product");
  }
};

export const getRecentlyViewed = async () => {
  try {
    const data = await AsyncStorage.getItem("recentProducts");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};
