import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Package, X, Check, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { guestStorage } from '@/lib/guestStorage';

const MyProducts: React.FC = () => {
  const { t } = useLanguage();
  const { isGuest } = useAuth();
  const { products, createProductMutation, updateProductMutation, deleteProductMutation, isLoading } = useProducts();
  const [guestWishlist, setGuestWishlist] = useState(isGuest ? guestStorage.getWishlist() : []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    brand: '',
    category: '',
    key_ingredients: '',
    is_currently_using: true,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ingredientsArray = formData.key_ingredients
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    await createProductMutation.mutateAsync({
      product_name: formData.product_name,
      brand: formData.brand || undefined,
      category: formData.category || undefined,
      key_ingredients: ingredientsArray.length > 0 ? ingredientsArray : undefined,
      is_currently_using: formData.is_currently_using,
      notes: formData.notes || undefined,
    });

    setFormData({
      product_name: '',
      brand: '',
      category: '',
      key_ingredients: '',
      is_currently_using: true,
      notes: ''
    });
    setShowAddModal(false);
  };

  const handleToggleUsing = async (productId: string, currentlyUsing: boolean) => {
    await updateProductMutation.mutateAsync({
      id: productId,
      updates: { is_currently_using: !currentlyUsing }
    });
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProductMutation.mutateAsync(productId);
    }
  };

  const handleGuestWishlistDelete = (itemId: string) => {
    if (confirm('Remove from wishlist?')) {
      guestStorage.removeFromWishlist(itemId);
      setGuestWishlist(guestStorage.getWishlist());
    }
  };

  const currentProducts = products?.filter(p => p.is_currently_using) || [];
  const pastProducts = products?.filter(p => !p.is_currently_using) || [];
  const wishlistProducts = products?.filter(p => p.category === 'wishlist') || [];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 pb-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-charcoal mb-2">{t('myProducts')}</h1>
            <p className="text-body-secondary">
              Track the products in your skincare routine
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gold text-cream hover:bg-gold/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addProduct')}
          </Button>
        </div>

        {/* Currently Using Section */}
        <div className="mb-8">
          <h2 className="font-body text-xl font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-gold" />
            Currently Using
          </h2>

          {currentProducts.length === 0 ? (
            <Card className="bg-white border-sand/50">
              <CardContent className="p-6 text-center text-body-secondary">
                No products yet. Add your first product to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentProducts.map((product) => (
                <Card key={product.id} className="bg-white border-sand/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-body font-semibold text-charcoal">
                          {product.product_name}
                        </CardTitle>
                        {product.brand && (
                          <p className="text-sm text-gold mt-1">{product.brand}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="text-body-secondary hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {product.category && (
                      <div>
                        <span className="text-xs text-charcoal/70 uppercase tracking-wide">
                          {t('category')}:
                        </span>
                        <span className="ml-2 text-sm text-charcoal">{product.category}</span>
                      </div>
                    )}

                    {product.key_ingredients && product.key_ingredients.length > 0 && (
                      <div>
                        <p className="text-xs text-charcoal/70 uppercase tracking-wide mb-2">
                          {t('keyIngredients')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.key_ingredients.map((ingredient, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-sand/30 rounded text-xs text-charcoal/80"
                            >
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.notes && (
                      <p className="text-sm text-body-secondary italic">
                        {product.notes}
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUsing(product.id, product.is_currently_using)}
                      className="w-full border-gold text-gold hover:bg-gold/10"
                    >
                      Mark as Not Using
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Wishlist Section */}
        {(wishlistProducts.length > 0 || guestWishlist.length > 0) && (
          <div className="mb-8">
            <h2 className="font-body text-xl font-semibold text-charcoal mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-gold" />
              Wishlist
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isGuest ? (
                guestWishlist.map((item) => (
                  <Card key={item.id} className="bg-white border-sand/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-body font-semibold text-charcoal">
                            {item.product_name}
                          </CardTitle>
                          {item.brand && (
                            <p className="text-sm text-gold mt-1">{item.brand}</p>
                          )}
                          {item.tier && (
                            <span className="inline-block mt-2 px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                              {item.tier}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGuestWishlistDelete(item.id)}
                          className="text-body-secondary hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {item.notes && (
                      <CardContent>
                        <p className="text-sm text-body-secondary italic">{item.notes}</p>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                wishlistProducts.map((product) => (
                  <Card key={product.id} className="bg-white border-sand/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-body font-semibold text-charcoal">
                            {product.product_name}
                          </CardTitle>
                          {product.brand && (
                            <p className="text-sm text-gold mt-1">{product.brand}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="text-body-secondary hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {product.notes && (
                        <p className="text-sm text-body-secondary italic mb-3">{product.notes}</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUsing(product.id, false)}
                        className="w-full border-gold text-gold hover:bg-gold/10"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Add to My Products
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Past Products Section */}
        {pastProducts.length > 0 && (
          <div>
            <h2 className="font-body text-xl font-semibold text-charcoal mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-body-secondary" />
              Not Currently Using
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastProducts.map((product) => (
                <Card key={product.id} className="bg-white border-sand/50 shadow-sm opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-body font-semibold text-charcoal">
                          {product.product_name}
                        </CardTitle>
                        {product.brand && (
                          <p className="text-sm text-gold mt-1">{product.brand}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="text-body-secondary hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUsing(product.id, product.is_currently_using)}
                      className="w-full border-gold text-gold hover:bg-gold/10"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Currently Using
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-charcoal/80 z-50 flex items-center justify-center p-4">
          <Card className="bg-cream max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-display text-charcoal">
                  {t('addProduct')}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    {t('productName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., Gentle Cleanser"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    {t('brand')}
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., CeraVe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    {t('category')}
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., Cleanser, Moisturizer, Serum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    {t('keyIngredients')}
                  </label>
                  <input
                    type="text"
                    value={formData.key_ingredients}
                    onChange={(e) => setFormData({ ...formData, key_ingredients: e.target.value })}
                    className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Separate with commas: Niacinamide, Hyaluronic Acid"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    rows={3}
                    placeholder="Personal notes about this product..."
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-sand/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="currently-using"
                    checked={formData.is_currently_using}
                    onChange={(e) => setFormData({ ...formData, is_currently_using: e.target.checked })}
                    className="w-4 h-4 text-gold focus:ring-gold"
                  />
                  <label htmlFor="currently-using" className="text-sm text-charcoal">
                    I'm currently using this product
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gold text-cream hover:bg-gold/90"
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? 'Adding...' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default MyProducts;
