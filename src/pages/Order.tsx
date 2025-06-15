
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  size: string;
  description: string;
  price: number;
  image: string;
}

const products: Product[] = [
  {
    id: '9kg',
    name: '9 Kg LP Gas Bottle REFILL',
    size: '9kg',
    description: "Small knee height bottle used for braai's, stoves & heaters. REFILL ONLY!",
    price: 344.00,
    image: '/lovable-uploads/f98a1122-5ed2-4266-9e70-c23cf4074c45.png'
  },
  {
    id: '19kg',
    name: '19 Kg LP Gas Bottle REFILL',
    size: '19kg',
    description: "Mid sized bottle used for braai's, stoves, heaters and small gas water heaters. REFILL ONLY!",
    price: 727.00,
    image: '/lovable-uploads/4de6ef66-00ba-4216-872f-a3f47fb75ab6.png'
  },
  {
    id: '48kg',
    name: '48 Kg LP Gas Bottle REFILL',
    size: '48kg',
    description: "Large bottle used for commercial applications, large gas water heaters and industrial use. REFILL ONLY!",
    price: 1855.00,
    image: '/lovable-uploads/fbf883ef-348c-4ef9-ab8c-73ca3e93ac2c.png'
  }
];

const Order = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { toast } = useToast();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const getQuantity = (productId: string) => {
    return quantities[productId] || 1;
  };

  const updateLocalQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const getCartQuantity = (productId: string) => {
    const cartItem = cartItems.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (product: Product) => {
    const quantity = getQuantity(product.id);
    const currentCartQuantity = getCartQuantity(product.id);
    
    if (currentCartQuantity > 0) {
      updateQuantity(product.id, currentCartQuantity + quantity);
    } else {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price
        });
      }
    }
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      updateQuantity(productId, 0);
    } else {
      updateQuantity(productId, newQuantity);
    }
    
    toast({
      title: "Cart updated",
      description: "Product quantity updated in your cart.",
    });
  };

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Gas Refills</h1>
        
        <div className="space-y-6">
          {products.map((product) => {
            const quantity = getQuantity(product.id);
            const cartQuantity = getCartQuantity(product.id);
            
            return (
              <div key={product.id} className="bg-onolo-dark-lighter rounded-2xl p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">{product.name}</h3>
                    <p className="text-onolo-gray text-sm mb-4 leading-relaxed">
                      {product.description}
                    </p>
                    <p className="text-onolo-orange text-2xl font-bold mb-4">
                      R {product.price.toFixed(2)}
                    </p>
                    
                    {cartQuantity > 0 && (
                      <div className="bg-onolo-dark rounded-xl p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-onolo-gray">
                            In cart: <span className="text-onolo-orange font-semibold">{cartQuantity}</span>
                          </p>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateCartQuantity(product.id, cartQuantity - 1)}
                              className="w-6 h-6 bg-onolo-orange rounded-full flex items-center justify-center hover:bg-onolo-orange-dark transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleUpdateCartQuantity(product.id, cartQuantity + 1)}
                              className="w-6 h-6 bg-onolo-orange rounded-full flex items-center justify-center hover:bg-onolo-orange-dark transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="text-sm font-medium">Add quantity:</span>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateLocalQuantity(product.id, quantity - 1)}
                          className="w-8 h-8 bg-onolo-orange rounded-full flex items-center justify-center hover:bg-onolo-orange-dark transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-semibold min-w-[2rem] text-center">{quantity}</span>
                        <button
                          onClick={() => updateLocalQuantity(product.id, quantity + 1)}
                          className="w-8 h-8 bg-onolo-orange rounded-full flex items-center justify-center hover:bg-onolo-orange-dark transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right mb-4">
                      <p className="text-sm text-onolo-gray">Total: </p>
                      <p className="text-onolo-orange text-xl font-bold">
                        R {(product.price * quantity).toFixed(2)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Order;
