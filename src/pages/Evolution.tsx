import React, { useState } from 'react';
import { useCheckIns } from '@/hooks/useCheckIns';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckInWithPhotos } from '@/types/database';
import ThreePhotoCheckIn from '@/components/ThreePhotoCheckIn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, ImageIcon, Plus, X } from 'lucide-react';

const Evolution: React.FC = () => {
  const { t } = useLanguage();
  const { checkIns, isLoading } = useCheckIns();
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedView, setSelectedView] = useState<'timeline' | 'comparison' | 'trends'>('timeline');
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckInWithPhotos | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-gold border-t-transparent" />
      </div>
    );
  }

  const sortedCheckIns = checkIns?.sort((a, b) =>
    new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  ) || [];

  const baseline = sortedCheckIns[sortedCheckIns.length - 1];
  const latest = sortedCheckIns[0];

  const handleCheckInComplete = () => {
    setShowCheckInModal(false);
  };

  // Render Timeline View
  const renderTimeline = () => {
    if (sortedCheckIns.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gold" />
          </div>
          <h3 className="font-display text-xl text-charcoal mb-2">No Check-ins Yet</h3>
          <p className="text-body-secondary mb-6">Start your skincare journey by completing your first check-in.</p>
          <Button
            onClick={() => setShowCheckInModal(true)}
            className="bg-gold text-cream hover:bg-gold/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('newCheckIn')}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sortedCheckIns.map((checkIn, index) => {
          const isBaseline = index === sortedCheckIns.length - 1;
          const frontPhoto = checkIn.photos?.find(p => p.photo_type === 'front');

          return (
            <Card
              key={checkIn.id}
              className="bg-white border-sand/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedCheckIn(checkIn);
                setSelectedView('comparison');
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Photo Thumbnail */}
                  <div className="w-20 h-20 rounded-lg bg-sand/20 flex-shrink-0 overflow-hidden">
                    {frontPhoto?.signed_url ? (
                      <img
                        src={frontPhoto.signed_url}
                        alt="Check-in"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-sand" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-body font-semibold text-charcoal">
                          {new Date(checkIn.session_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </h3>
                        {isBaseline && (
                          <span className="text-xs text-gold uppercase tracking-wide">
                            {t('baseline')}
                          </span>
                        )}
                      </div>
                      {checkIn.overall_score && (
                        <div className="text-right">
                          <div className="text-2xl font-display text-gold">
                            {checkIn.overall_score}
                          </div>
                          <div className="text-xs text-body-secondary">/ 100</div>
                        </div>
                      )}
                    </div>

                    {checkIn.ai_summary && (
                      <p className="text-sm text-body-secondary line-clamp-2 mb-2">
                        {checkIn.ai_summary}
                      </p>
                    )}

                    {checkIn.derived_features?.detected_concerns && checkIn.derived_features.detected_concerns.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {checkIn.derived_features.detected_concerns.slice(0, 3).map((concern, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-sand/30 rounded text-xs text-charcoal/70"
                          >
                            {concern}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render Comparison View
  const renderComparison = () => {
    if (!baseline || !selectedCheckIn) {
      return (
        <div className="text-center py-12 text-body-secondary">
          {sortedCheckIns.length < 2 ? (
            <p>Complete at least 2 check-ins to see comparisons.</p>
          ) : (
            <p>Select a check-in from the timeline to compare.</p>
          )}
        </div>
      );
    }

    const baselineFront = baseline.photos?.find(p => p.photo_type === 'front');
    const selectedFront = selectedCheckIn.photos?.find(p => p.photo_type === 'front');

    return (
      <div className="space-y-6">
        {/* Photo Comparison */}
        <Card className="bg-white border-sand/50">
          <CardHeader>
            <CardTitle className="text-lg font-body font-semibold text-charcoal">
              Photo Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Baseline */}
              <div>
                <div className="aspect-[3/4] rounded-lg bg-sand/20 overflow-hidden mb-2">
                  {baselineFront?.signed_url ? (
                    <img
                      src={baselineFront.signed_url}
                      alt="Baseline"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-sand" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-center text-body-secondary">
                  {t('baseline')} · {new Date(baseline.session_date).toLocaleDateString()}
                </p>
                {baseline.overall_score && (
                  <p className="text-center text-gold font-semibold mt-1">
                    Score: {baseline.overall_score}/100
                  </p>
                )}
              </div>

              {/* Selected */}
              <div>
                <div className="aspect-[3/4] rounded-lg bg-sand/20 overflow-hidden mb-2">
                  {selectedFront?.signed_url ? (
                    <img
                      src={selectedFront.signed_url}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-sand" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-center text-body-secondary">
                  {new Date(selectedCheckIn.session_date).toLocaleDateString()}
                </p>
                {selectedCheckIn.overall_score && (
                  <p className="text-center text-gold font-semibold mt-1">
                    Score: {selectedCheckIn.overall_score}/100
                  </p>
                )}
              </div>
            </div>

            {/* Score Change */}
            {baseline.overall_score && selectedCheckIn.overall_score && (
              <div className="mt-4 p-3 bg-gold/10 rounded-lg text-center">
                <p className="text-sm text-body-secondary mb-1">Overall Progress</p>
                <p className="text-2xl font-display text-charcoal">
                  {selectedCheckIn.overall_score > baseline.overall_score ? '+' : ''}
                  {(selectedCheckIn.overall_score - baseline.overall_score).toFixed(1)} points
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metric Changes */}
        {baseline.derived_features && selectedCheckIn.derived_features && (
          <Card className="bg-white border-sand/50">
            <CardHeader>
              <CardTitle className="text-lg font-body font-semibold text-charcoal">
                Metric Changes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'uneven_tone_score', label: 'Even Tone' },
                { key: 'texture_score', label: 'Texture' },
                { key: 'oiliness_score', label: 'Oil Balance' },
                { key: 'barrier_comfort_score', label: 'Barrier Comfort' }
              ].map(({ key, label }) => {
                const baselineVal = baseline.derived_features?.[key as keyof typeof baseline.derived_features] as number | undefined;
                const selectedVal = selectedCheckIn.derived_features?.[key as keyof typeof selectedCheckIn.derived_features] as number | undefined;

                if (!baselineVal || !selectedVal) return null;

                const change = selectedVal - baselineVal;
                const isPositive = change > 0;

                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-charcoal">{label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-body-secondary">{baselineVal.toFixed(0)}</span>
                      <div className="w-16 h-2 bg-sand/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold"
                          style={{ width: `${selectedVal}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-charcoal">{selectedVal.toFixed(0)}</span>
                      <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-amber-600'}`}>
                        {isPositive ? '+' : ''}{change.toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render Trends View
  const renderTrends = () => {
    if (sortedCheckIns.length < 2) {
      return (
        <div className="text-center py-12 text-body-secondary">
          <p>Complete at least 2 check-ins to see trends.</p>
        </div>
      );
    }

    const metrics = [
      { key: 'uneven_tone_score', label: 'Even Tone', color: '#9B7542' },
      { key: 'texture_score', label: 'Texture', color: '#D9D1BC' },
      { key: 'oiliness_score', label: 'Oil Balance', color: '#B8935E' },
      { key: 'barrier_comfort_score', label: 'Barrier Comfort', color: '#1F1A14' }
    ];

    return (
      <div className="space-y-6">
        {/* Overall Score Trend */}
        <Card className="bg-white border-sand/50">
          <CardHeader>
            <CardTitle className="text-lg font-body font-semibold text-charcoal">
              Overall Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...sortedCheckIns].reverse().map((checkIn, index) => {
                const isLatest = index === sortedCheckIns.length - 1;
                return (
                  <div key={checkIn.id} className="flex items-center gap-3">
                    <span className="text-xs text-body-secondary w-24">
                      {new Date(checkIn.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 h-8 bg-sand/20 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gold transition-all duration-500"
                        style={{ width: `${checkIn.overall_score || 0}%` }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-charcoal">
                        {checkIn.overall_score?.toFixed(0) || 0}
                      </span>
                    </div>
                    {isLatest && (
                      <span className="text-xs text-gold uppercase tracking-wide">Latest</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Individual Metrics */}
        {metrics.map(({ key, label, color }) => {
          const hasData = sortedCheckIns.some(ci => ci.derived_features?.[key as keyof typeof ci.derived_features]);
          if (!hasData) return null;

          return (
            <Card key={key} className="bg-white border-sand/50">
              <CardHeader>
                <CardTitle className="text-lg font-body font-semibold text-charcoal">
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...sortedCheckIns].reverse().map((checkIn) => {
                    const value = checkIn.derived_features?.[key as keyof typeof checkIn.derived_features] as number | undefined;
                    if (!value) return null;

                    return (
                      <div key={checkIn.id} className="flex items-center gap-3">
                        <span className="text-xs text-body-secondary w-24">
                          {new Date(checkIn.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 h-6 bg-sand/20 rounded-full overflow-hidden relative">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${value}%`,
                              backgroundColor: color
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-charcoal">
                            {value.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="p-4 pb-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-charcoal mb-2">{t('evolution')}</h1>
            <p className="text-body-secondary">
              Track your skincare journey over time
            </p>
          </div>
          {sortedCheckIns.length > 0 && (
            <Button
              onClick={() => setShowCheckInModal(true)}
              className="bg-gold text-cream hover:bg-gold/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('newCheckIn')}
            </Button>
          )}
        </div>

        {/* View Tabs */}
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as typeof selectedView)} className="w-full">
          <TabsList className="w-full bg-sand/30 p-1 rounded-xl mb-6">
            <TabsTrigger
              value="timeline"
              className="flex-1 data-[state=active]:bg-cream data-[state=active]:text-gold data-[state=active]:shadow-sm rounded-lg font-body font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="flex-1 data-[state=active]:bg-cream data-[state=active]:text-gold data-[state=active]:shadow-sm rounded-lg font-body font-medium"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Compare
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="flex-1 data-[state=active]:bg-cream data-[state=active]:text-gold data-[state=active]:shadow-sm rounded-lg font-body font-medium"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            {renderTimeline()}
          </TabsContent>

          <TabsContent value="comparison">
            {renderComparison()}
          </TabsContent>

          <TabsContent value="trends">
            {renderTrends()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-charcoal/80 z-50 flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <Button
              onClick={() => setShowCheckInModal(false)}
              variant="ghost"
              className="absolute top-4 right-4 z-10"
            >
              <X className="w-5 h-5" />
            </Button>
            <ThreePhotoCheckIn onComplete={handleCheckInComplete} />
          </div>
        </div>
      )}
    </>
  );
};

export default Evolution;
