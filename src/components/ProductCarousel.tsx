import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductRecommendation } from '@/types/database';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, DollarSign, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { guestStorage } from '@/lib/guestStorage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductCarouselProps {
  recommendations: ProductRecommendation[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ recommendations }) => {
  const { t } = useLanguage();
  const { user, isGuest } = useAuth();
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: false });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const addToWishlist = async (rec: ProductRecommendation) => {
    try {
      if (isGuest) {
        // Add to guest storage
        guestStorage.addToWishlist({
          product_name: rec.product_name,
          brand: rec.brand || undefined,
          tier: rec.tier,
          category: undefined,
          notes: rec.why_recommended || undefined,
          is_owned: false,
        });
        toast.success(`${rec.product_name} added to wishlist!`);
      } else if (user) {
        // Add to Supabase
        const { error } = await supabase.from('user_products').insert({
          user_id: user.id,
          product_name: rec.product_name,
          brand: rec.brand,
          category: 'wishlist',
          key_ingredients: rec.key_ingredients || [],
          is_currently_using: false,
          notes: rec.why_recommended,
        });

        if (error) throw error;
        toast.success(`${rec.product_name} added to wishlist!`);
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'best':
        return t('bestPick');
      case 'budget':
        return t('budgetPick');
      case 'premium':
        return t('premiumPick');
      default:
        return tier;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'best':
        return 'bg-gold text-cream';
      case 'budget':
        return 'bg-green-600 text-white';
      case 'premium':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-sand text-charcoal';
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  // Sort recommendations: best, budget, premium
  const sortedRecs = [...recommendations].sort((a, b) => {
    const order = { best: 1, budget: 2, premium: 3 };
    return (order[a.tier as keyof typeof order] || 99) - (order[b.tier as keyof typeof order] || 99);
  });

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {sortedRecs.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-cream/90 hover:bg-cream shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-cream/90 hover:bg-cream shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {sortedRecs.map((rec) => (
            <div key={rec.id} className="flex-[0_0_100%] min-w-0">
              <Card className="bg-cream border-sand/50 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getTierColor(rec.tier)}`}>
                      {getTierLabel(rec.tier)}
                    </span>
                    {rec.estimated_price && (
                      <div className="flex items-center gap-1 text-body-secondary">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">{rec.estimated_price.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-body font-semibold text-charcoal">
                    {rec.product_name}
                  </CardTitle>
                  {rec.brand && (
                    <p className="text-sm text-gold uppercase tracking-wide">{rec.brand}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Ingredients */}
                  {rec.key_ingredients && rec.key_ingredients.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal/70 mb-2 uppercase tracking-wide">
                        {t('keyIngredients')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {rec.key_ingredients.map((ingredient, idx) => (
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

                  {/* Why Recommended */}
                  {rec.why_recommended && (
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal/70 mb-2 uppercase tracking-wide">
                        Why This Product
                      </h4>
                      <p className="text-sm text-body-secondary leading-relaxed">
                        {rec.why_recommended}
                      </p>
                    </div>
                  )}

                  {/* How to Use */}
                  {rec.how_to_use && (
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal/70 mb-2 uppercase tracking-wide">
                        How to Use
                      </h4>
                      <p className="text-sm text-body-secondary leading-relaxed">
                        {rec.how_to_use}
                      </p>
                    </div>
                  )}

                  {/* Cautions */}
                  {rec.cautions && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="text-xs font-semibold text-amber-900 mb-1 uppercase tracking-wide">
                        Cautions
                      </h4>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {rec.cautions}
                      </p>
                    </div>
                  )}

                  {/* Alternatives */}
                  {rec.alternatives && rec.alternatives.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal/70 mb-2 uppercase tracking-wide">
                        Similar Alternatives
                      </h4>
                      <ul className="space-y-1">
                        {rec.alternatives.map((alt, idx) => (
                          <li key={idx} className="text-sm text-body-secondary">
                            • {alt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Add to Wishlist */}
                  <Button
                    onClick={() => addToWishlist(rec)}
                    className="w-full bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20"
                    variant="outline"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Wishlist
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {sortedRecs.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {sortedRecs.map((rec, idx) => (
            <button
              key={rec.id}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === 0 ? 'bg-gold w-6' : 'bg-sand'
              }`}
              aria-label={`Go to ${getTierLabel(rec.tier)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
