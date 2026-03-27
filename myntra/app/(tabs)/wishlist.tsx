import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../../context/ThemeContext";
import { useWishlist, WishlistItem } from "../../context/WishlistContext";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80?text=No+Image";

export default function Wishlist() {
  const { wishlist, setWishlist } = useWishlist();
  const { colors } = useTheme();
  const router = useRouter();

  // ✅ Send FULL stored product (no fake fallback)
  const goToProduct = (product: WishlistItem) => {
    const productFull = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      offerPrice: product.offerPrice,
      image: product.image || PLACEHOLDER_IMAGE,
      description: product.description,
      sizes: product.sizes,
    };

    const productParam = encodeURIComponent(JSON.stringify(productFull));
    router.push(`/product?productData=${productParam}`);
  };

  const removeItem = (id: string) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
  };

  if (!wishlist || wishlist.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.subText, fontSize: 16 }}>
          Your wishlist is empty
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>
          My Wishlist ({wishlist.length})
        </Text>
      </View>

      <FlatList
        contentContainerStyle={{ padding: 12 }}
        data={wishlist}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12, padding: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: item.image || PLACEHOLDER_IMAGE }}
                style={styles.image}
              />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                  numberOfLines={2}
                >
                  {item.name || "Unnamed Product"}
                </Text>

                <View style={{ flexDirection: "row" }}>
                  <Button
                    title="Remove"
                    onPress={() => removeItem(item.id)}
                    style={{ marginRight: 8, flex: 1 }}
                  />

                  <Button
                    title="Buy Now"
                    onPress={() => goToProduct(item)}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
  },
});