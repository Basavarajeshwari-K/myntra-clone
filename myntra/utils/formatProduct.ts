const BASE_URL = "https://myntra-clone-wkhe.onrender.com";

export interface FormattedProduct {
  _id?: string;
  id?: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  offer?: number | null;
  image: string;
  sizes: string[];
  category?: string;
  description?: string;
  raw?: any;
}

export const formatProduct = (product: any): FormattedProduct | null => {
  if (!product) return null;

  // ---------- IMAGE ----------
  let image = "";

  if (typeof product.image === "string" && product.image.trim() !== "") {
    image = product.image;
  } else if (Array.isArray(product.images) && product.images.length > 0) {
    image = product.images[0];
  } else {
    image = "https://via.placeholder.com/300x400?text=No+Image";
  }

  // Decode if already encoded
  try {
    image = decodeURIComponent(image);
  } catch {
    // ignore decode errors
  }

  // Remove duplicate uploads path
  image = image.replace("/uploads/uploads/", "/uploads/");

  // Prefix backend URL if needed
  if (!image.startsWith("http")) {
    if (image.startsWith("/")) {
      image = `${BASE_URL}${image}`;
    } else {
      image = `${BASE_URL}/uploads/${image}`;
    }
  }

  // ---------- BRAND ----------
  let brand = product.brand;
  if (!brand || brand === "") {
    if (product.description) {
      const words = product.description.split(" ");
      brand = words[words.length - 1];
    } else {
      brand = "Fashion";
    }
  }

  // ---------- PRICE / MRP ----------
  const price = Number(product.price) || 0;
  const mrp = Number(product.mrp || Math.round(price * 1.25));

  // ---------- OFFER ----------
  let offer: number | null = null;
  if (mrp > price) {
    offer = Math.round(((mrp - price) / mrp) * 100);
  }

  // ---------- SIZES ----------
let sizes: string[] = [];

if (Array.isArray(product.sizes) && product.sizes.length > 0) {
  sizes = product.sizes;
}
else if (Array.isArray(product.size) && product.size.length > 0) {
  sizes = product.size;
}
else if (typeof product.sizes === "string") {
  sizes = [product.sizes];
}
else if (typeof product.size === "string") {
  sizes = [product.size];
}
else if (product.category === "Footwear") {
  sizes = ["7", "8", "9", "10"];
}
else if (product.category === "Clothing") {
  sizes = ["S", "M", "L", "XL"];
}

  return {
    _id: product._id || product.id,
    name: product.name || "No Name",
    brand,
    price,
    mrp,
    offer,
    image,
    sizes,
    category: product.category || "",
    description: product.description || "",
    raw: product,
  };
};