// Sample products repeat the available photos until real inventory is added.
const productTypes = [
  {
    type: 'Shirt',
    category: 'Upperwear',
    image: '/media/things/upperwear/shirt.webp',
    products: [
      ['Classic Everyday Shirt', '₹799', '4.6', 128],
      ['Relaxed Fit Shirt', '₹899', '4.4', 86],
      ['Oxford Style Shirt', '₹999', '4.7', 143],
      ['Weekend Check Shirt', '₹849', '4.3', 72],
      ['Essential Casual Shirt', '₹949', '4.5', 109],
    ],
  },
  {
    type: 'T-Shirt',
    category: 'Upperwear',
    image: '/media/things/upperwear/t-shirt.webp',
    products: [
      ['Essential T-Shirt', '₹399', '4.5', 214],
      ['Graphic T-Shirt', '₹499', '4.3', 97],
      ['Relaxed Fit Tee', '₹449', '4.6', 156],
      ['Everyday Cotton Tee', '₹549', '4.4', 121],
      ['Street Style T-Shirt', '₹599', '4.7', 184],
    ],
  },
  {
    type: 'Pants',
    category: 'Bottomwear',
    image: '/media/things/bottomwear/jeans.webp',
    products: [
      ['Straight Fit Pants', '₹999', '4.5', 112],
      ['Everyday Pants', '₹1,099', '4.2', 73],
      ['Classic Denim Pants', '₹1,199', '4.6', 148],
      ['Relaxed Fit Trousers', '₹1,299', '4.4', 91],
      ['Modern Fit Pants', '₹1,149', '4.7', 167],
    ],
  },
  {
    type: 'Cargo',
    category: 'Bottomwear',
    image: '/media/things/bottomwear/cargo.webp',
    products: [
      ['Utility Cargo', '₹1,199', '4.7', 164],
      ['Relaxed Cargo Pants', '₹1,299', '4.4', 91],
      ['Everyday Cargo', '₹1,099', '4.5', 118],
      ['Street Cargo Trousers', '₹1,399', '4.6', 142],
      ['Classic Utility Cargo', '₹1,249', '4.3', 82],
    ],
  },
  {
    type: 'Sneakers',
    category: 'Footwear',
    image: '/media/things/footwear/sneakers.webp',
    products: [
      ['Everyday Sneakers', '₹1,499', '4.6', 205],
      ['Classic Sneakers', '₹1,699', '4.3', 104],
      ['Street Style Sneakers', '₹1,899', '4.7', 173],
      ['Low-Top Sneakers', '₹1,599', '4.4', 126],
      ['Daily Wear Sneakers', '₹1,749', '4.5', 139],
    ],
  },
  {
    type: 'Slides',
    category: 'Footwear',
    image: '/media/things/footwear/slides.webp',
    products: [
      ['Everyday Slides', '₹499', '4.4', 178],
      ['Classic Slides', '₹599', '4.2', 89],
      ['Comfort Fit Slides', '₹699', '4.6', 133],
      ['Sport Style Slides', '₹649', '4.5', 117],
      ['Easy Wear Slides', '₹549', '4.3', 96],
    ],
  },
]

export const items = productTypes.flatMap(({ type, category, image, products }) =>
  products.map(([name, price, rating, reviewCount], index) => ({
    id: `${type.toLowerCase().replaceAll(' ', '-')}-${index + 1}`,
    name,
    type,
    category,
    image,
    alt: `${name} sample from the MBF Stores ${category.toLowerCase()} collection`,
    price,
    rating,
    reviewCount,
  })),
)
