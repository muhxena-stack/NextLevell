export interface Product {
    id: number;
    nama: string;
    harga: number;
    deskripsi: string;
    urlGambar: string;
}

// Tipe untuk Item Keranjang (dengan kuantitas)
export interface CartItem {
    product: Product;
    quantity: number;
}

// Tipe untuk Cart Context
export interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void; 
    removeFromCart: (productId: number) => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}