import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

interface Product {
  _id: string;
  name: string;
  price: number;
  mrp?: number;
  offer?: number;
  image?: string;
  sizes?: string[];
  category?: string;
  brand?: string;
  description?: string;
}

const BASE_URL = "https://myntra-clone-wkhe.onrender.com";

const YouMayAlsoLike: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  // Robust helper to get final image URL
  const getFinalImage = (image?: string) => {
  if (!image) return "https://via.placeholder.com/140";
  if (image.startsWith("http")) return image;

  // Remove duplicate slashes
  return `${BASE_URL}/${image.replace(/^\/+/, "")}`;
};
  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />;
  }

  const displayProducts = products.slice(0, 6);

  const renderItem = ({ item }: { item: Product }) => {
    const finalPrice = item.offer
      ? item.price - Math.round((item.price * item.offer) / 100)
      : item.price;

    const imageUrl = getFinalImage(item.image);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/product",
            params: {
              id: item._id,
              name: item.name,
              price: item.price,
              brand: item.brand,
              description: item.description,
              image: imageUrl,
              sizes: JSON.stringify(item.sizes || []),
            },
          })
        }
      >
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

        <Text style={styles.brand}>{item.brand || "Unknown Brand"}</Text>

        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.price}>
          ₹{finalPrice}
          {item.offer ? (
            <>
              {" "}
              <Text style={styles.originalPrice}>₹{item.price}</Text> ({item.offer}% OFF)
            </>
          ) : null}
        </Text>

        <Text style={styles.sizes}>
          Sizes: {item.sizes && item.sizes.length > 0 ? item.sizes.join(", ") : "N/A"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You May Also Like</Text>

      <FlatList
        horizontal
        data={displayProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8, marginLeft: 10 },
  card: {
    width: 160,
    marginHorizontal: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: { width: 140, height: 140, borderRadius: 10, marginBottom: 5 },
  brand: { fontSize: 12, color: "#555" },
  name: { fontSize: 14, fontWeight: "500", textAlign: "center" },
  price: { fontSize: 13, color: "#888", marginTop: 2, textAlign: "center" },
  originalPrice: { textDecorationLine: "line-through", color: "#777", fontSize: 12 },
  sizes: { fontSize: 12, color: "#555", marginTop: 2 },
});

export default YouMayAlsoLike;