// In-memory database for demo purposes
// In production, use a proper database like MongoDB, PostgreSQL, etc.

const users = [];
const orders = [];

// Product data
const product = {
    id: 'premium-tea-blend',
    name: 'Premium Tea Blend',
    description: 'Our signature blend combines the finest tea leaves from around the world. This exquisite 250g collection features a harmonious mix of black, green, and oolong teas, carefully curated to deliver a rich, aromatic experience with every cup.',
    longDescription: 'Experience the ultimate tea journey with our Premium Tea Blend. Hand-picked from the misty mountains of Sri Lanka, the lush gardens of China, and the pristine estates of India, each leaf is selected for its exceptional quality and flavor profile.\n\nOur master blenders have perfected this recipe over years, creating a balanced infusion that offers notes of honey, bergamot, and subtle floral undertones. Perfect for any time of day, this blend provides both refreshment and relaxation.\n\nEach 250g bag is sealed at peak freshness to ensure you receive the most aromatic and flavorful tea possible.',
    price: 1500,
    currency: 'SAR',
    weight: '250g',
    images: [
        '/images/tea-product-1.jpg',
        '/images/tea-product-2.jpg',
        '/images/tea-product-3.jpg'
    ],
    features: [
        'Premium hand-picked tea leaves',
        '250g of pure excellence',
        'Carefully curated blend',
        'Rich aromatic flavor',
        'Vacuum-sealed for freshness',
        'Perfect for hot or iced tea'
    ],
    reviews: [
        {
            id: 1,
            userName: 'Fatima A.',
            rating: 5,
            date: '2025-10-15',
            comment: 'Absolutely wonderful! The flavor is exquisite and the quality is unmatched. I order this every month now.'
        },
        {
            id: 2,
            userName: 'Mohammed S.',
            rating: 5,
            date: '2025-10-28',
            comment: 'Best tea I have ever tasted. The blend is perfect and the aroma fills the entire house when brewing.'
        },
        {
            id: 3,
            userName: 'Sarah K.',
            rating: 4,
            date: '2025-11-05',
            comment: 'Great quality tea! Slightly pricey but definitely worth it for special occasions.'
        },
        {
            id: 4,
            userName: 'Ahmed R.',
            rating: 5,
            date: '2025-11-12',
            comment: 'My family loves this tea. We serve it to all our guests and everyone asks where we get it from!'
        }
    ],
    inStock: true,
    averageRating: 4.75
};

module.exports = {
    users,
    orders,
    product
};
