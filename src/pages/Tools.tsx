import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pipette, Clock, AlertCircle } from 'lucide-react';

// Sample tools data - in production, this would come from the AI analysis
const sampleTools = [
  {
    id: '1',
    tool: 'Facial Massage',
    instructions: 'Using clean hands or a facial oil, gently massage your face in upward circular motions. Focus on areas of tension like the jaw, temples, and forehead. Use light to medium pressure.',
    duration: '2-3 minutes',
    frequency: 'Daily (morning or evening)',
    stop_if: 'Redness, irritation, or discomfort occurs'
  },
  {
    id: '2',
    tool: 'Gua Sha',
    instructions: 'Apply facial oil or serum. Hold the gua sha tool at a 15-degree angle. Gently glide it across your face in upward and outward strokes. Start from the center of your face and move outward toward the hairline.',
    duration: '3-5 minutes',
    frequency: '3-4 times per week',
    stop_if: 'Bruising, excessive redness, or pain occurs'
  },
  {
    id: '3',
    tool: 'Ice Roller',
    instructions: 'Keep the ice roller in the freezer. Roll it gently over your face in upward motions for a depuffing and soothing effect. Great for reducing inflammation and tightening pores.',
    duration: '1-2 minutes',
    frequency: 'As needed (especially mornings)',
    stop_if: 'Skin feels overly cold or uncomfortable'
  },
  {
    id: '4',
    tool: 'Lymphatic Drainage',
    instructions: 'Using gentle pressure with your fingers, massage from the center of your face outward toward your lymph nodes (near ears and neck). This helps reduce puffiness and promotes circulation.',
    duration: '2-4 minutes',
    frequency: 'Daily (best in the morning)',
    stop_if: 'You experience pain or excessive tenderness'
  }
];

const Tools: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-4 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal mb-2">{t('tools')}</h1>
        <p className="text-body-secondary">
          Complementary tools and techniques to enhance your routine
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-charcoal leading-relaxed">
            These tools and techniques are optional additions to your skincare routine.
            Always use clean tools and follow proper hygiene practices. Stop immediately if you experience any discomfort.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-4">
        {sampleTools.map((tool) => (
          <Card key={tool.id} className="bg-white border-sand/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Pipette className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-body font-semibold text-charcoal">
                    {tool.tool}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-body-secondary">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{tool.duration}</span>
                    </div>
                    <div>
                      <span className="text-gold">•</span> {tool.frequency}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Instructions */}
              <div>
                <h4 className="text-xs font-semibold text-charcoal/70 uppercase tracking-wide mb-2">
                  How to Use
                </h4>
                <p className="text-sm text-body-secondary leading-relaxed">
                  {tool.instructions}
                </p>
              </div>

              {/* Stop If */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-1">
                  Stop If
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {tool.stop_if}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-sand/20 rounded-lg">
        <p className="text-xs text-body-secondary leading-relaxed">
          <strong>Note:</strong> These tools are complementary and not required for your routine to be effective.
          Your personalized AI recommendations may suggest specific tools based on your skin concerns and goals.
        </p>
      </div>
    </div>
  );
};

export default Tools;
