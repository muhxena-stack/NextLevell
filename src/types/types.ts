export interface Product {
    id: number;
    nama: string;
    harga: number;
    deskripsi: string;
    urlGambar: string;
    kategori: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void; 
    removeFromCart: (productId: number) => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}