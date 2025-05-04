import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Add item to cart
  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItemIndex = currentCart.findIndex(
        (item) => item._id === product._id
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity if not exceeding stock
        const updatedCart = [...currentCart];
        const existingItem = updatedCart[existingItemIndex];

        if (existingItem.quantity < product.stock) {
          updatedCart[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          };
        }

        return updatedCart;
      } else {
        // Item doesn't exist, add it with quantity 1
        return [...currentCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Increase item quantity
  const increaseQuantity = (productId) => {
    setCart((currentCart) => {
      return currentCart.map((item) => {
        if (item._id === productId && item.quantity < item.stock) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
    });
  };

  // Decrease item quantity
  const decreaseQuantity = (productId) => {
    setCart((currentCart) => {
      return currentCart
        .map((item) => {
          if (item._id === productId && item.quantity > 1) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item._id !== productId)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartTotal,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
