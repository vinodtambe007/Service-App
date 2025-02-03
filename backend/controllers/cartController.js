import CartModel from "../models/cartModel.js";

// Add to Cart Controller
export const addToCart = async (req, res) => {
  try {
    const {
      provider,
      userId,
      userName,
      userLocation,
      scheduleTime,
      finalPrice,
    } = req.body;

    // Find the cart for the user
    let cart = await CartModel.findOne({ userId });

    // Define the provider details and a new order for this provider
    const providerDetails = {
      _id: provider._id,
      name: provider.name,
      description: provider.description,
      price: finalPrice,
      email: provider.email,
      phone: provider.phone,
      location: {
        latitude: provider.location.latitude,
        longitude: provider.location.longitude,
      },
      address: provider.address,
      image: provider.image,
      orders: [
        {
          userName,
          userLocation,
          scheduleTime,
          orderPlacedAt: new Date(),
          status: "placed",
        },
      ],
    };

    // If no cart exists for the user, create a new one
    if (!cart) {
      cart = new CartModel({
        userId,
        items: [{ provider: providerDetails }],
      });
    } else {
      // Check if the provider is already in the cart
      const providerExists = cart.items.find(
        (item) => item.provider._id.toString() === provider._id
      );

      if (providerExists) {
        return res
          .status(400)
          .json({ message: "Provider is already in the cart" });
      }

      // Add the new provider to the existing cart
      cart.items.push({ provider: providerDetails });
    }

    // Save the updated cart
    await cart.save();
    res.status(201).json({ message: "Provider added to cart", cart });
  } catch (error) {
    console.error("Error adding provider to cart:", error);
    res.status(500).json({ message: "Failed to add provider to cart" });
  }
};

//getData from the cart
export const getCartItems = async (req, res) => {
  try {
    const { userId } = req.body; // Extract userId from the request body

    // Find the cart for the user (no populate needed)
    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      // Return an empty cart if no cart is found for the user
      return res.status(200).json({ cart: { items: [] } });
    }

    res.status(200).json({ message: "Cart data fetched", cart });
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({ message: "Failed to fetch cart data" });
  }

  const { providerId } = req.body;
};

// Remove from Cart Controller
export const removeItemFromCart = async (req, res) => {
  const { userId, providerId } = req.body; // Expecting userId and providerId in the request body

  try {
    // Attempt to find the user's cart and remove the specified item
    const updatedCart = await CartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { "provider._id": providerId } } }, // Remove the item based on provider._id
      { new: true } // Return the updated cart
    );

    // Check if the cart was found and updated
    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Send the updated cart back to the client
    res
      .status(200)
      .json({ message: "Item removed from cart", cart: updatedCart });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
};

//clearCart controller
export const clearCart = async (req, res) => {
  // console.log("clearing the cart");
  const { userId } = req.body; // Expecting userId in the request body
  // console.log(userId);

  try {
    // Attempt to find and remove the user's cart
    const deletedCart = await CartModel.findOneAndDelete({ userId });

    // Check if the cart was found and deleted
    if (!deletedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Send a success message back to the client
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
