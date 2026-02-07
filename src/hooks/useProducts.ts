import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserProduct } from '@/types/database';
import { useAuth } from './useAuth';

export const useProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all user products
  const {
    data: products,
    isLoading,
    error,
  } = useQuery<UserProduct[]>({
    queryKey: ['userProducts', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_products')
        .select('*')
        .eq('user_id', user.id)
        .order('is_currently_using', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch only currently used products
  const {
    data: currentProducts,
  } = useQuery<UserProduct[]>({
    queryKey: ['currentProducts', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_currently_using', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Add product
  const addProductMutation = useMutation({
    mutationFn: async (productData: Omit<UserProduct, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_products')
        .insert({
          user_id: user.id,
          ...productData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProducts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['currentProducts', user?.id] });
    },
  });

  // Update product
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserProduct> }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_products')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProducts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['currentProducts', user?.id] });
    },
  });

  // Delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProducts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['currentProducts', user?.id] });
    },
  });

  return {
    products,
    currentProducts,
    isLoading,
    error,
    addProduct: addProductMutation.mutate,
    isAdding: addProductMutation.isPending,
    updateProduct: updateProductMutation.mutate,
    isUpdating: updateProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutate,
    isDeleting: deleteProductMutation.isPending,
  };
};
