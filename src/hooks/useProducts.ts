import { useQuery } from '@tanstack/react-query';
import { storefrontApiRequest, PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, ShopifyProduct } from '@/lib/shopify';

export function useProducts(query?: string, first: number = 20) {
  return useQuery({
    queryKey: ['products', query, first],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCTS_QUERY, { first, query });
      return (data?.data?.products?.edges || []) as ShopifyProduct[];
    },
  });
}

export function useProductByHandle(handle: string) {
  return useQuery({
    queryKey: ['product', handle],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
      return data?.data?.productByHandle || null;
    },
    enabled: !!handle,
  });
}
