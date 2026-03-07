// MOCK PRODUCT DATA
// In production: Fetched from AWS API Gateway → Lambda → DynamoDB
// All images hosted on CloudFront CDN
// Example: https://d123example.cloudfront.net/products/shirt-1.jpg

export const mockProducts = [
  {
    id: '1',
    name: 'Summer Breeze Linen Shirt',
    description: 'Lightweight linen shirt perfect for warm summer days. Breathable fabric with a relaxed fit.',
    price: 89.99,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '2',
    name: 'Coastal Wave Midi Dress',
    description: 'Flowing midi dress with soft wave patterns. Perfect for beach evenings or summer gatherings.',
    price: 129.99,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '3',
    name: 'Sunset Cargo Shorts',
    description: 'Comfortable cargo shorts with a modern fit. Multiple pockets for functionality meets style.',
    price: 69.99,
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
    sizes: ['28', '30', '32', '34', '36'],
    inStock: true
  },
  {
    id: '4',
    name: 'Ocean Breeze Blazer',
    description: 'Lightweight summer blazer in premium cotton blend. Smart-casual perfection.',
    price: 159.99,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '5',
    name: 'Coral Reef Swimsuit',
    description: 'Elegant one-piece swimsuit with a tasteful cut. Quick-dry fabric with UV protection.',
    price: 79.99,
    category: 'Swimwear',
    image: 'https://images.unsplash.com/photo-1570976447640-ac859083963f?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '6',
    name: 'Beach Walk Sandals',
    description: 'Comfortable leather sandals with cushioned footbed. Perfect for long summer walks.',
    price: 49.99,
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80',
    sizes: ['6', '7', '8', '9', '10', '11'],
    inStock: true
  },
  {
    id: '7',
    name: 'Golden Hour Sunglasses',
    description: 'Polarized sunglasses with UV400 protection. Timeless design meets modern materials.',
    price: 119.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: '8',
    name: 'Tide Pool Tote Bag',
    description: 'Spacious canvas tote with water-resistant lining. Your perfect beach companion.',
    price: 39.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: '9',
    name: 'Summer Glow Kimono',
    description: 'Lightweight kimono with delicate floral print. Layer over any outfit for instant elegance.',
    price: 94.99,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: '10',
    name: 'Palm Breeze Crop Top',
    description: 'Fitted crop top in organic cotton. Perfect for pairing with high-waisted bottoms.',
    price: 44.99,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true
  },
  {
    id: '11',
    name: 'Horizon Wide-Leg Pants',
    description: 'Flowing wide-leg pants in breathable fabric. Comfort meets sophistication.',
    price: 99.99,
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '12',
    name: 'Seashell Straw Hat',
    description: 'Wide-brim straw hat with adjustable chin strap. Essential sun protection with style.',
    price: 54.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80',
    sizes: ['S/M', 'L/XL'],
    inStock: true
  },
  {
    id: '13',
    name: 'Warm Sand Linen Set',
    description: 'Matching linen co-ord set in warm sand tones. Effortlessly chic for any summer occasion.',
    price: 149.99,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '14',
    name: 'Terracotta Wrap Dress',
    description: 'Flattering wrap dress in rich terracotta. A summer wardrobe essential.',
    price: 119.99,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '15',
    name: 'Ivory Oversized Blazer',
    description: 'Relaxed-fit oversized blazer in ivory. Pairs effortlessly over anything.',
    price: 175.00,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1548454782-15b189d129ab?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '16',
    name: 'Amber Slide Sandals',
    description: 'Minimalist leather slide sandals in warm amber. All-day comfort with refined style.',
    price: 65.00,
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    sizes: ['6', '7', '8', '9', '10'],
    inStock: true
  },
  {
    id: '17',
    name: 'Dune Linen Trousers',
    description: 'Wide-leg linen trousers in a muted dune tone. Light, airy, and effortlessly elegant.',
    price: 109.00,
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '18',
    name: 'Woven Leather Belt',
    description: 'Handcrafted woven leather belt. A subtle accent that elevates any look.',
    price: 35.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    sizes: ['S', 'M', 'L'],
    inStock: true
  },
  {
    id: '19',
    name: 'Sunrise Bodysuit',
    description: 'Sleek bodysuit in sunrise amber. Versatile for styling with bottoms of any kind.',
    price: 58.00,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true
  },
  {
    id: '20',
    name: 'Cream Knit Sweater',
    description: 'Soft-knit pullover in cream white. The perfect transition-season layer.',
    price: 95.00,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '21',
    name: 'Raffia Crossbody Bag',
    description: 'Handwoven raffia crossbody with leather strap. A natural texture that makes a statement.',
    price: 72.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: '22',
    name: 'Striped Linen Shirt',
    description: 'Classic striped linen shirt with a relaxed summer silhouette.',
    price: 82.00,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '23',
    name: 'Halter Maxi Dress',
    description: 'Flowing halter-neck maxi in warm ivory. Designed for golden-hour moments.',
    price: 139.00,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '24',
    name: 'Minimalist Gold Bracelet',
    description: 'Delicate gold-tone bracelet. A subtle accent for everyday wear.',
    price: 28.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
    sizes: ['One Size'],
    inStock: true
  }
];

export const categories = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Swimwear',
  'Footwear',
  'Accessories'
];