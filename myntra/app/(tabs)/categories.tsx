import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { Search } from "lucide-react-native";

const MEN_PRODUCTS = [
  {
    id: "men1",
    name: "Casual Shirt",
    brand: "Roadster",
    price: 1499,
    offer: 25,
    image:
      "https://images.pexels.com/photos/17901262/pexels-photo-17901262.jpeg",
    description: "Comfortable cotton casual shirt designed for everyday wear.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "men2",
    name: "Hoodie",
    brand: "H&M",
    price: 2199,
    offer: 30,
    image:
      "https://images.pexels.com/photos/12738136/pexels-photo-12738136.jpeg",
    description: "Soft hoodie perfect for casual outings.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "men3",
    name: "Jeans",
    brand: "Levi's",
    price: 1999,
    offer: 20,
    image:
      "https://images.pexels.com/photos/30710244/pexels-photo-30710244.jpeg",
    description: "Slim fit denim jeans for daily wear.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "men4",
    name: "Jacket",
    brand: "Nike",
    price: 2999,
    offer: 35,
    image:
      "https://images.pexels.com/photos/13030489/pexels-photo-13030489.jpeg",
    description: "Warm winter jacket with sporty look.",
    sizes: ["S", "M", "L", "XL"],
  },
];

const WOMEN_PRODUCTS = [
  {
    id: "women1",
    name: "Bodycon Dress",
    brand: "Zara",
    price: 2499,
    offer: 40,
    image:
      "https://images.pexels.com/photos/22042371/pexels-photo-22042371.jpeg",
    description: "Elegant bodycon dress for parties.",
    sizes: ["S", "M", "L"],
  },
  {
    id: "women2",
    name: "Kurti",
    brand: "FabIndia",
    price: 1799,
    offer: 35,
    image:
      "https://images.pexels.com/photos/35521738/pexels-photo-35521738.jpeg",
    description: "Traditional ethnic kurti.",
    sizes: ["S", "M", "L"],
  },
  {
    id: "women3",
    name: "Top",
    brand: "H&M",
    price: 999,
    offer: 25,
    image:
      "https://images.pexels.com/photos/22223044/pexels-photo-22223044.jpeg",
    description: "Stylish casual top.",
    sizes: ["S", "M", "L"],
  },
  {
    id: "women4",
    name: "Leather Handbag",
    brand: "Michael Kors",
    price: 3299,
    offer: 30,
    image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
    description: "Premium leather handbag.",
    sizes: ["One Size"],
  },
];

const KIDS_PRODUCTS = [
  {
    id: "kids1",
    name: "Kids T-Shirt",
    brand: "Carter's",
    price: 799,
    offer: 20,
    image: "https://images.pexels.com/photos/5560037/pexels-photo-5560037.jpeg",
    description: "Soft cotton t-shirt.",
    sizes: ["S", "M", "L"],
  },
  {
    id: "kids2",
    name: "Kids Jacket",
    brand: "Allen Solly",
    price: 1299,
    offer: 30,
    image:
      "https://images.pexels.com/photos/29189974/pexels-photo-29189974.jpeg",
    description: "Warm winter jacket.",
    sizes: ["S", "M", "L"],
  },
  {
    id: "kids3",
    name: "Frock Dress",
    brand: "FirstCry",
    price: 899,
    offer: 25,
    image:
      "https://images.pexels.com/photos/36046015/pexels-photo-36046015.jpeg",
    description: "Beautiful kids dress.",
    sizes: ["S", "M", "L"],
  },
  {
    id: "kids4",
    name: "Kids Shoes",
    brand: "Nike",
    price: 699,
    offer: 20,
    image: "https://images.pexels.com/photos/9537104/pexels-photo-9537104.jpeg",
    description: "Comfortable running shoes.",
    sizes: ["S", "M", "L"],
  },
];

const BEAUTY_PRODUCTS = [
  {
    id: "beauty1",
    name: "Foundation",
    brand: "Nykaa",
    price: 899,
    offer: 20,
    image:
      "https://images.pexels.com/photos/20903471/pexels-photo-20903471.jpeg",
    description: "Smooth liquid foundation.",
    sizes: ["One Size"],
  },
  {
    id: "beauty2",
    name: "Perfume",
    brand: "Chanel",
    price: 1999,
    offer: 35,
    image:
      "https://images.pexels.com/photos/21926653/pexels-photo-21926653.jpeg",
    description: "Luxury perfume.",
    sizes: ["One Size"],
  },
  {
    id: "beauty3",
    name: "Lipstick",
    brand: "MAC",
    price: 599,
    offer: 25,
    image: "https://images.pexels.com/photos/4699180/pexels-photo-4699180.jpeg",
    description: "Rich color lipstick.",
    sizes: ["One Size"],
  },
  {
    id: "beauty4",
    name: "Mascara",
    brand: "MAC",
    price: 799,
    offer: 30,
    image:
      "https://images.pexels.com/photos/20499753/pexels-photo-20499753.jpeg",
    description: "Volumizing mascara.",
    sizes: ["One Size"],
  },
];

const CATEGORY_DATA = [
  {
    id: "men",
    title: "Men",
    banner: MEN_PRODUCTS[0].image,
    subcategories: [
      { id: "shirts", title: "Shirts" },
      { id: "hoodie", title: "Hoodie" },
      { id: "jeans", title: "Jeans" },
      { id: "jacket", title: "Jacket" },
    ],
    products: MEN_PRODUCTS,
  },
  {
    id: "women",
    title: "Women",
    banner: WOMEN_PRODUCTS[0].image,
    subcategories: [
      { id: "bodycon", title: "Bodycon Dress" },
      { id: "kurti", title: "Kurti" },
      { id: "top", title: "Top" },
      { id: "bag", title: "Handbag" },
    ],
    products: WOMEN_PRODUCTS,
  },
  {
    id: "kids",
    title: "Kids",
    banner: KIDS_PRODUCTS[0].image,
    subcategories: [
      { id: "tshirt", title: "T-Shirt" },
      { id: "jacket", title: "Jacket" },
      { id: "frock", title: "Frock" },
      { id: "shoes", title: "Shoes" },
    ],
    products: KIDS_PRODUCTS,
  },
  {
    id: "beauty",
    title: "Beauty",
    banner: BEAUTY_PRODUCTS[0].image,
    subcategories: [
      { id: "foundation", title: "Foundation" },
      { id: "perfume", title: "Perfume" },
      { id: "lipstick", title: "Lipstick" },
      { id: "mascara", title: "Mascara" },
    ],
    products: BEAUTY_PRODUCTS,
  },
];

export default function Category() {
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<any>({});

  const renderProduct = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.productCard, { backgroundColor: colors.card }]}
      onPress={() =>
        router.push({
          pathname: "/product",
          params: { product: JSON.stringify(item) },
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={[styles.brand, { color: colors.text }]}>{item.brand}</Text>
      <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.price, { color: colors.text }]}>
        ₹{item.price} ({item.offer}% OFF)
      </Text>
    </TouchableOpacity>
  );

  const renderSubcategory = (catId: string, item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.subTextBox}
      onPress={() =>
        setSelectedSub((prev: any) => ({
          ...prev,
          [catId]: item.title,
        }))
      }
    >
      <Text style={{ color: "#000", fontWeight: "500" }}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, color: colors.text }}>
        Categories
      </Text>

      <View style={styles.searchBox}>
        <Search size={18} color="#999" />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, marginLeft: 8, color: colors.text }}
        />
      </View>

      {CATEGORY_DATA.map((cat) => {

        let filteredProducts =
          search.trim() === ""
            ? cat.products
            : cat.products.filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
              );

        if (selectedSub[cat.id]) {
          filteredProducts = filteredProducts.filter((p) =>
            p.name.toLowerCase().includes(selectedSub[cat.id].toLowerCase())
          );
        }

        return (
          <View key={cat.id}>
            <Image
              source={{ uri: cat.banner }}
              style={{ width: "100%", height: 150, borderRadius: 8, marginBottom: 10 }}
            />

            <FlatList
              data={cat.subcategories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderSubcategory(cat.id, item)}
              style={{ marginBottom: 15 }}
            />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>{cat.title}</Text>

            <View style={styles.grid}>
              {filteredProducts.map((item) => renderProduct(item))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  subTextBox: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    borderRadius: 10,
    marginBottom: 12,
    padding: 8,
  },
  productImage: {
    width: "100%",
    height: 140,
    borderRadius: 8,
  },
  brand: { fontSize: 12, fontWeight: "bold", marginTop: 5 },
  name: { fontSize: 13 },
  price: { fontSize: 13, fontWeight: "bold", marginTop: 4 },
});