export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  image: string;
  weight: string;
  inventory: number;
}

export const product: Product = {
  id: "lula-tea-premium-200g",
  name: "Premium Loose Leaf Blend",
  nameAr: "مزيج أوراق الشاي المميز",
  description: "Our signature blend features carefully selected ingredients that create a unique and memorable taste. Each batch is made with love and attention to detail.",
  descriptionAr: "مزيجنا المميز يحتوي على مكونات مُختارة بعناية تخلق طعماً فريداً لا يُنسى. كل دفعة مُحضّرة بحب واهتمام بالتفاصيل.",
  price: 60,
  currency: "SAR",
  image: "/images/Product Image2.jpg",
  weight: "200g",
  inventory: 20,
};
