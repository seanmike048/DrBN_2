# Dr Beauté Noire v3 - Deployment Guide (Updated 2026-02-01)

## 🎉 NEW FEATURES (v3 Update)

### ✅ Guest Mode
- **No auth required**: Users can test the full app without creating an account
- **localStorage persistence**: Profile, plans, and wishlist saved locally
- **Seamless migration**: When guest signs up, data auto-migrates to Supabase
- **"Continue as Guest" button**: Prominent on auth page

### ✅ Onboarding Questionnaire
- **7-question flow**: Comprehensive skin profile collection before first plan
- **Smart routing**: Shows automatically for new users (guest or auth)
- **Skip option**: For testing purposes
- **Profile-based AI**: All data used to personalize plan generation

### ✅ Optional Photos
- **Two paths**: Generate plan with OR without photos
- **No forced camera**: Photos enhance analysis but aren't required
- **Test mode friendly**: Perfect for debugging and QA

### ✅ Today as Main Tab
- **Default destination**: Today replaces Evolution as primary screen
- **Clear CTAs**: "Generate Plan" prominent when no plan exists
- **Dual generation**: With photos / Without photos options

### ✅ Wishlist Feature
- **"Add to Wishlist" button**: On all product recommendations
- **Dual storage**: localStorage (guest) / Supabase (auth)
- **MyProducts integration**: Wishlist section shows saved products

### ✅ Tools Icon Update
- **Sparkles replaces Wrench**: More beauty-appropriate icon
- **Consistent branding**: Matches premium aesthetic

---

# Dr Beauté Noire v2 - Deployment Guide

## Prerequisites

- Supabase project created and configured
- Lovable API key for Gemini AI access
- Node.js and npm installed locally

## Deployment Steps

### 1. Database Setup

Run the comprehensive database migration to create all tables with RLS policies:

```bash
# Navigate to Supabase project dashboard
# Go to SQL Editor and run the following file:
supabase/migrations/20260201120000_comprehensive_schema.sql
```

This migration creates:
- `profiles` table with auto-creation trigger
- `check_ins` table for session tracking
- `check_in_photos` table for 3-photo storage
- `derived_features` table for AI-extracted metrics
- `routines` table for versioned skincare routines
- `routine_steps` table for routine steps
- `product_recommendations` table for 3-tier product picks
- `user_products` table for user inventory
- `chat_sessions` and `chat_messages` for Plus mode
- `user_settings` table with auto-creation trigger
- All RLS policies for user-scoped access

### 2. Storage Bucket Setup

Create a private storage bucket for check-in photos:

```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('check-in-photos', 'check-in-photos', false);

-- Create RLS policies for the bucket
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'check-in-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'check-in-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'check-in-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Edge Function Deployment

Deploy the enhanced AI analysis edge function:

```bash
# Make sure you have Supabase CLI installed
supabase functions deploy skin-analysis-v2

# Set the LOVABLE_API_KEY secret
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key_here
```

Test the function:
```bash
supabase functions invoke skin-analysis-v2 --data '{
  "profile": {
    "skin_type": "combination",
    "concerns": ["hyperpigmentation"],
    "climate": "humid",
    "budget_tier": "standard"
  },
  "language": "en"
}'
```

### 4. Environment Variables

Ensure your `.env` file has all required variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Frontend Deployment

Build and deploy the frontend:

```bash
# Build for production
npm run build

# Deploy to your hosting platform (Vercel, Netlify, etc.)
# Example for Vercel:
vercel --prod
```

## Post-Deployment Verification

### Database Check
- [ ] All tables created successfully
- [ ] RLS policies active on all tables
- [ ] Auto-triggers working (profiles, user_settings)
- [ ] Cascading deletes configured correctly

### Storage Check
- [ ] `check-in-photos` bucket created
- [ ] Bucket is private (not public)
- [ ] RLS policies allow user-scoped upload/view/delete
- [ ] Signed URLs working correctly (7-day expiry)

### Edge Function Check
- [ ] Function deploys without errors
- [ ] LOVABLE_API_KEY secret is set
- [ ] Function returns structured JSON response
- [ ] EN/FR prompts working correctly
- [ ] Photo analysis (3-photo support) working
- [ ] Error handling (rate limits, credits) working

### Frontend Check
- [ ] Landing page loads for non-authenticated users
- [ ] Auth flow works (sign up, sign in, sign out)
- [ ] Authenticated users redirect to dashboard
- [ ] All dashboard tabs render correctly
- [ ] Camera permissions requested properly
- [ ] Camera lifecycle cleanup verified (no active camera after close)

### End-to-End Flow
1. [ ] Sign up new user → profile and settings auto-created
2. [ ] Navigate to Evolution → Click "New Check-in"
3. [ ] Complete 3-photo check-in (front, left profile, right profile)
4. [ ] Photos upload to private storage
5. [ ] AI analysis runs successfully
6. [ ] Routine created with versioning
7. [ ] Today Plan shows routine with product recommendations
8. [ ] Product carousel swipes correctly
9. [ ] Evolution timeline shows check-in
10. [ ] Comparison view works (baseline vs latest)
11. [ ] Trends charts display correctly
12. [ ] My Products inventory CRUD works
13. [ ] Tools and Nutrition pages display correctly

## Security Verification

### Privacy & Data Protection
- [ ] All photos stored in private bucket
- [ ] RLS enforces user-scoped access only
- [ ] No public bucket access
- [ ] Signed URLs expire after 7 days
- [ ] Cascading deletes remove all user data on account deletion

### Camera Lifecycle
- [ ] Camera stops on capture
- [ ] Camera stops on modal close
- [ ] Camera stops on component unmount
- [ ] Camera stops on step change
- [ ] Camera stops on retake
- [ ] No orphaned MediaStream tracks

### Non-Medical Disclaimer
- [ ] Disclaimer visible on all relevant screens
- [ ] "This is cosmetic guidance only" messaging present
- [ ] Dermatologist escalation recommendations included for red flags

## Known Issues & Limitations

1. **Plus Mode (Chat)**: Placeholder only - full chat implementation pending
2. **Audio Notes**: Not yet implemented (Plus mode feature)
3. **Chunk Size Warning**: Build produces 600KB+ chunk - consider code splitting for production
4. **Old Components**: Legacy Dashboard, Onboarding, LoadingScreen components still in codebase but not used in new flow

## Next Steps (Optional Enhancements)

1. Implement Plus mode with gated chat feature
2. Add audio note recording for check-ins
3. Implement code splitting to reduce bundle size
4. Add push notifications for routine reminders
5. Create shareable routine links
6. Add export to PDF functionality
7. Implement dark mode
8. Add analytics and tracking
9. Build admin dashboard for monitoring
10. Add A/B testing framework

## Support & Troubleshooting

### Common Issues

**Issue**: Photos not uploading
- Check storage bucket exists and is named `check-in-photos`
- Verify RLS policies are active
- Check network tab for CORS errors

**Issue**: AI analysis fails
- Verify LOVABLE_API_KEY is set correctly
- Check edge function logs in Supabase dashboard
- Verify Gemini API credits are available

**Issue**: RLS policy errors
- Ensure user is authenticated
- Check RLS policies match user_id correctly
- Verify auth.uid() is accessible in policies

**Issue**: Camera not stopping
- Check all cleanup points in ThreePhotoCheckIn component
- Verify streamRef.current.getTracks().forEach(track => track.stop())
- Check for memory leaks in browser DevTools

## Performance Optimization

1. Enable Supabase Edge Functions caching for repeated requests
2. Implement CDN caching for static assets
3. Use dynamic imports for route-based code splitting
4. Optimize images (WebP format, responsive sizing)
5. Enable gzip compression on hosting platform
6. Monitor Core Web Vitals and optimize accordingly

---

**Note**: This guide assumes a standard Supabase + Vercel/Netlify deployment. Adjust steps based on your specific infrastructure.
