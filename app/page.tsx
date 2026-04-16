import { getProducts } from '@/lib/products';
import { HomePageClient } from '@/components/HomePageClient';

export default async function Home() {
  const products = await getProducts();
  return <HomePageClient products={products} />;
}
