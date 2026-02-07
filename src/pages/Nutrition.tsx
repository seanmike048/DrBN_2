import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Apple, Droplets, Flame, Leaf } from 'lucide-react';

const Nutrition: React.FC = () => {
  const { t } = useLanguage();

  const nutritionCards = [
    {
      id: 'hydration',
      icon: Droplets,
      title: 'Hydration',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      content: [
        'Drink at least 8 glasses (2L) of water daily for optimal skin hydration',
        'Herbal teas (green tea, rooibos) provide antioxidants',
        'Coconut water offers natural electrolytes',
        'Limit caffeine and alcohol as they can dehydrate skin'
      ],
      tip: 'Start your day with a glass of water with lemon to kickstart hydration and support skin brightness.'
    },
    {
      id: 'anti-inflammatory',
      icon: Flame,
      title: 'Anti-Inflammatory Foods',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      content: [
        'Fatty fish (salmon, mackerel) rich in omega-3s reduce inflammation',
        'Leafy greens (spinach, kale) packed with vitamins A, C, and E',
        'Berries (blueberries, strawberries) full of antioxidants',
        'Turmeric and ginger have natural anti-inflammatory properties',
        'Nuts and seeds (walnuts, chia seeds) support skin barrier function'
      ],
      tip: 'Add a handful of berries to your breakfast or a turmeric latte in the afternoon for consistent anti-inflammatory benefits.'
    },
    {
      id: 'protein-fiber',
      icon: Leaf,
      title: 'Protein & Fiber Balance',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      content: [
        'Lean proteins (chicken, fish, tofu, legumes) support collagen production',
        'Whole grains (quinoa, brown rice, oats) provide sustained energy',
        'Legumes (lentils, chickpeas, black beans) offer both protein and fiber',
        'Fiber-rich vegetables support gut health, which reflects in skin clarity',
        'Aim for 25-30g of fiber daily for optimal digestion'
      ],
      tip: 'Include a protein source and fiber-rich food at every meal to maintain stable blood sugar, which helps prevent inflammation and breakouts.'
    },
    {
      id: 'vitamins',
      icon: Apple,
      title: 'Essential Vitamins & Minerals',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      content: [
        'Vitamin C (citrus, bell peppers) boosts collagen and brightens skin',
        'Vitamin E (avocado, almonds) protects against oxidative stress',
        'Vitamin A (sweet potatoes, carrots) supports cell turnover',
        'Zinc (pumpkin seeds, shellfish) helps with acne and wound healing',
        'Selenium (Brazil nuts) has antioxidant properties'
      ],
      tip: 'Eat a rainbow of colorful fruits and vegetables to ensure you get a wide range of vitamins and minerals.'
    }
  ];

  const foodsToLimit = [
    'High-sugar foods (candy, sodas, pastries) - can trigger inflammation and breakouts',
    'Processed foods with artificial additives - may worsen skin sensitivity',
    'Excessive dairy - some people experience acne from dairy consumption',
    'Trans fats and fried foods - promote inflammation and premature aging'
  ];

  return (
    <div className="p-4 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal mb-2">{t('nutrition')}</h1>
        <p className="text-body-secondary">
          Nourish your skin from within with these dietary guidelines
        </p>
      </div>

      {/* Introduction */}
      <Card className="mb-6 bg-gold/10 border-gold/30">
        <CardContent className="p-4">
          <p className="text-sm text-charcoal leading-relaxed">
            <strong>Remember:</strong> Skincare is holistic. What you eat directly impacts your skin health.
            A balanced diet rich in whole foods, adequate hydration, and anti-inflammatory ingredients
            can enhance your topical skincare routine and promote a healthy, radiant complexion.
          </p>
        </CardContent>
      </Card>

      {/* Nutrition Cards */}
      <div className="space-y-6">
        {nutritionCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.id} className="bg-white border-sand/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full ${card.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <CardTitle className="text-xl font-body font-semibold text-charcoal pt-2">
                    {card.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Content List */}
                <ul className="space-y-2">
                  {card.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-body-secondary">
                      <span className={`${card.color} mt-1.5 flex-shrink-0`}>•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Tip */}
                <div className={`p-3 ${card.bgColor} rounded-lg border ${card.color.replace('text-', 'border-')}`}>
                  <p className="text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                    Quick Tip
                  </p>
                  <p className="text-sm text-charcoal leading-relaxed">
                    {card.tip}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Foods to Limit */}
      <Card className="mt-6 bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg font-body font-semibold text-amber-900">
            Foods to Limit or Avoid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {foodsToLimit.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="text-amber-600 mt-1.5 flex-shrink-0">⚠</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Footer Disclaimer */}
      <div className="mt-6 p-4 bg-sand/20 rounded-lg">
        <p className="text-xs text-body-secondary leading-relaxed">
          <strong>Disclaimer:</strong> This nutritional guidance is for general wellness and is not medical or dietary advice.
          Consult a registered dietitian or healthcare provider for personalized nutrition plans, especially if you have
          allergies, dietary restrictions, or health conditions.
        </p>
      </div>
    </div>
  );
};

export default Nutrition;
