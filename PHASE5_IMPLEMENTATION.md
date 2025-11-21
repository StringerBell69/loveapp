# Phase 5 Implementation Guide - Bonus & Polish ✨

## ✅ Completed (Foundation)

### Database Schema
- ✅ Created `user_preferences` table with theme/personalization settings
- ✅ Created `backups` table for backup history tracking
- ✅ Created `onboarding_progress` table for tour completion
- ✅ Created `feature_flags` table for gradual rollout
- ✅ Created `analytics_events` table for usage tracking
- ✅ Added enums: `theme_palette`, `backup_format`, `analytics_event_type`

### Schema Details

**user_preferences**: Theme palette (5 options), dark mode, couple avatar, background image, language, font scale, reduced motion, high contrast, push subscription

**backups**: Format (json/pdf/ics/zip), file URL, size, metadata about backup contents

**onboarding_progress**: 8 milestone flags, current step, completion tracking

**feature_flags**: Key-value flags, rollout percentage, enabled couples list

**analytics_events**: Event type, name, data, page, session, user agent

## 🚧 Next Steps - Implementation

### 1. PWA Configuration

#### public/manifest.json
Create PWA manifest:

```json
{
  "name": "Notre Calendrier 💕",
  "short_name": "Calendrier",
  "description": "L'app pour couples qui aiment planifier ensemble",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF5F7",
  "theme_color": "#FF6B9D",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/calendar.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["lifestyle", "social"],
  "shortcuts": [
    {
      "name": "Nouveau message",
      "url": "/messages/new",
      "description": "Envoyer un message d'amour"
    },
    {
      "name": "Ajouter un événement",
      "url": "/calendar/new",
      "description": "Créer un nouvel événement"
    },
    {
      "name": "Noter mon humeur",
      "url": "/mood/new",
      "description": "Enregistrer mon humeur du jour"
    }
  ]
}
```

#### public/sw.js - Service Worker
Create service worker with caching strategy:

```javascript
const CACHE_NAME = 'calendrier-v1';
const RUNTIME_CACHE = 'calendrier-runtime';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/calendar',
  '/messages',
  '/settings',
  '/offline.html'
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests - network only
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Images - cache first
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((response) => {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Navigation - network first, fallback to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Default - network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notre Calendrier 💕', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
```

#### app/layout.tsx - Register Service Worker
Add to root layout:

```typescript
'use client'

import { useEffect } from 'react'

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF6B9D" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Calendrier" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

#### public/offline.html - Offline Fallback Page
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hors ligne - Notre Calendrier 💕</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #FFF5F7 0%, #FFE5E5 100%);
      color: #2D3748;
      text-align: center;
      padding: 20px;
    }
    h1 { font-size: 3rem; margin: 0; }
    p { font-size: 1.2rem; margin: 20px 0; }
    button {
      background: #FF6B9D;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>💔</h1>
  <h2>Vous êtes hors ligne</h2>
  <p>Vérifiez votre connexion internet pour accéder à votre calendrier.</p>
  <button onclick="window.location.reload()">Réessayer</button>
</body>
</html>
```

### 2. Push Notifications System

#### lib/notifications/push.ts - Push Notification Manager

```typescript
import { createBrowserClient } from '@/lib/supabase/client'

export type NotificationType =
  | 'mood_reminder'
  | 'gratitude_reminder'
  | 'question_of_day'
  | 'partner_mood_alert'
  | 'ritual_reminder'
  | 'event_reminder'
  | 'birthday_reminder'
  | 'partner_message'
  | 'partner_answered_question'
  | 'shared_gratitude_ready'

export interface PushNotificationPayload {
  type: NotificationType
  title: string
  body: string
  url?: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, any>
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    // Check if service worker is ready
    const registration = await navigator.serviceWorker.ready

    // Request notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission denied')
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    // Save subscription to database
    await savePushSubscription(subscription)

    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      await removePushSubscription()
    }

    return true
  } catch (error) {
    console.error('Failed to unsubscribe:', error)
    return false
  }
}

async function savePushSubscription(subscription: PushSubscription) {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('No authenticated user')

  await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      push_subscription: subscription.toJSON(),
      push_notifications_enabled: true
    })
}

async function removePushSubscription() {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('user_preferences')
    .update({
      push_subscription: null,
      push_notifications_enabled: false
    })
    .eq('user_id', user.id)
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<boolean> {
  // This would be called from your backend/API route
  // Send to your push notification service (e.g., OneSignal, Firebase, custom)

  try {
    const response = await fetch('/api/notifications/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, payload })
    })

    return response.ok
  } catch (error) {
    console.error('Failed to send push notification:', error)
    return false
  }
}
```

#### api/notifications/push/route.ts - Push API Endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, payload } = await request.json()

    // Get user's push subscription
    const supabase = createClient()
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('push_subscription, push_notifications_enabled')
      .eq('user_id', userId)
      .single()

    if (!preferences?.push_notifications_enabled || !preferences.push_subscription) {
      return NextResponse.json({ error: 'Push notifications not enabled' }, { status: 400 })
    }

    // Send push notification
    await webpush.sendNotification(
      preferences.push_subscription,
      JSON.stringify(payload)
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
```

#### components/settings/PushNotificationToggle.tsx

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/lib/notifications/push'

export function PushNotificationToggle() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check current subscription status
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setEnabled(!!subscription)
        })
      })
    }
  }, [])

  async function handleToggle(checked: boolean) {
    setLoading(true)

    if (checked) {
      const subscription = await subscribeToPushNotifications()
      setEnabled(!!subscription)
    } else {
      const success = await unsubscribeFromPushNotifications()
      setEnabled(!success)
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="push-notifications">Notifications push</Label>
      <Switch
        id="push-notifications"
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  )
}
```

### 3. Statistics & Charts

#### Dependencies
```bash
bun add recharts
```

#### hooks/useStatistics.ts

```typescript
// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useCouple } from './useCouple'

export interface CoupleStatistics {
  // Events
  totalEvents: number
  upcomingEvents: number
  eventsThisMonth: number

  // Memories
  totalMemories: number
  memoriesThisYear: number

  // Messages
  totalMessages: number
  messagesThisWeek: number

  // Bucket List
  totalBucketItems: number
  completedBucketItems: number
  bucketCompletionRate: number

  // Rituals
  totalRituals: number
  activeStreaks: number
  longestStreak: number

  // Mood
  moodLogsThisMonth: number
  mostCommonMood: { emoji: string; label: string; count: number } | null
  moodSynchronyRate: number // % of days both logged mood

  // Gratitude
  totalGratitudes: number
  gratitudeStreakDays: number
  sharedGratitudesCount: number

  // Questions
  totalQuestionsAnswered: number
  questionsAnsweredTogether: number

  // Engagement
  daysSinceCreation: number
  loginStreak: number
  averageTimeSpent: number
}

export function useStatistics() {
  const [stats, setStats] = useState<CoupleStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const { couple } = useCouple()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!couple?.id) {
      setLoading(false)
      return
    }

    fetchStatistics()
  }, [couple?.id])

  async function fetchStatistics() {
    if (!couple?.id) return

    try {
      // Call PostgreSQL function to get aggregated stats
      const { data, error } = await supabase
        .rpc('get_couple_stats', { p_couple_id: couple.id })

      if (error) throw error

      setStats(data as CoupleStatistics)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    loading,
    refetch: fetchStatistics
  }
}
```

#### app/(app)/statistics/page.tsx - Statistics Dashboard

```typescript
'use client'

import { motion } from 'framer-motion'
import { useStatistics } from '@/hooks/useStatistics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Calendar, Heart, MessageCircle, Target, Sparkles, Smile } from 'lucide-react'

const COLORS = ['#FF6B9D', '#C7CEEA', '#FFC9B9', '#FFB3BA', '#BAE1D3']

export default function StatisticsPage() {
  const { stats, loading } = useStatistics()

  if (loading || !stats) {
    return <div>Chargement...</div>
  }

  // Prepare chart data
  const overviewData = [
    { name: 'Événements', value: stats.totalEvents, icon: Calendar },
    { name: 'Souvenirs', value: stats.totalMemories, icon: Heart },
    { name: 'Messages', value: stats.totalMessages, icon: MessageCircle },
    { name: 'Rêves réalisés', value: stats.completedBucketItems, icon: Target },
    { name: 'Rituels', value: stats.totalRituals, icon: Sparkles },
  ]

  const moodDistribution = [
    { name: 'Amoureux', value: 45, fill: '#FF6B9D' },
    { name: 'Heureux', value: 30, fill: '#FFC9B9' },
    { name: 'Calme', value: 15, fill: '#C7CEEA' },
    { name: 'Stressé', value: 7, fill: '#FFB3BA' },
    { name: 'Triste', value: 3, fill: '#BAE1D3' },
  ]

  return (
    <div className="min-h-screen p-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Statistiques 📊</h1>
          <p className="text-muted-foreground">Votre histoire ensemble en chiffres</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {overviewData.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose/20">
                      <item.icon className="w-6 h-6 text-rose" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{item.value}</p>
                      <p className="text-sm text-muted-foreground">{item.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Charts */}
        <Tabs defaultValue="engagement" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="mood">Humeur</TabsTrigger>
            <TabsTrigger value="activities">Activités</TabsTrigger>
          </TabsList>

          <TabsContent value="engagement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Taux de complétion</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Bucket List', rate: stats.bucketCompletionRate },
                    { name: 'Humeur quotidienne', rate: (stats.moodLogsThisMonth / 30) * 100 },
                    { name: 'Questions', rate: (stats.questionsAnsweredTogether / stats.totalQuestionsAnswered) * 100 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#FF6B9D" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mood" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution des humeurs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Synchronie émotionnelle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-rose">
                    {stats.moodSynchronyRate.toFixed(0)}%
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Des jours où vous avez tous les deux noté votre humeur
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rituels et séries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Séries actives</span>
                    <span className="font-bold">{stats.activeStreaks} 🔥</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Plus longue série</span>
                    <span className="font-bold">{stats.longestStreak} jours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Série de gratitude</span>
                    <span className="font-bold">{stats.gratitudeStreakDays} jours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Time Together */}
        <Card>
          <CardHeader>
            <CardTitle>Votre histoire 💕</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold">{stats.daysSinceCreation}</p>
                <p className="text-sm text-muted-foreground">Jours ensemble sur l'app</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.loginStreak}</p>
                <p className="text-sm text-muted-foreground">Jours de connexion consécutifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
```

### 4. Personalization System

#### Theme Palettes Configuration
Create `lib/themes/palettes.ts`:

```typescript
export const themePalettes = {
  classic: {
    name: 'Classique 💕',
    primary: '#FF6B9D',
    secondary: '#C7CEEA',
    accent: '#FFC9B9',
    background: '#FFF5F7',
    foreground: '#2D3748',
  },
  sunset: {
    name: 'Coucher de soleil 🌅',
    primary: '#FF6B6B',
    secondary: '#FFB347',
    accent: '#FFC9DE',
    background: '#FFF4E6',
    foreground: '#2D3748',
  },
  ocean: {
    name: 'Océan 🌊',
    primary: '#4A90E2',
    secondary: '#7EC8E3',
    accent: '#B8E6F6',
    background: '#F0F8FF',
    foreground: '#1A365D',
  },
  lavender: {
    name: 'Lavande 💜',
    primary: '#A78BFA',
    secondary: '#C4B5FD',
    accent: '#E9D5FF',
    background: '#FAF5FF',
    foreground: '#4C1D95',
  },
  forest: {
    name: 'Forêt 🌲',
    primary: '#48BB78',
    secondary: '#68D391',
    accent: '#9AE6B4',
    background: '#F0FFF4',
    foreground: '#22543D',
  },
} as const

export type ThemePalette = keyof typeof themePalettes
```

#### hooks/usePreferences.ts

```typescript
// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { UserPreference, NewUserPreference } from '@/lib/db/schema'

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreference | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    fetchPreferences()
  }, [user?.id])

  async function fetchPreferences() {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      // Create default preferences if none exist
      if (!data) {
        const defaultPrefs = {
          user_id: user.id,
          theme_palette: 'classic',
          dark_mode: false,
          language: 'fr',
          font_scale: 100,
          reduced_motion: false,
          high_contrast: false,
          push_notifications_enabled: false,
        }

        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert(defaultPrefs as any)
          .select()
          .single()

        if (insertError) throw insertError

        setPreferences(newPrefs as UserPreference)
      } else {
        setPreferences(data as UserPreference)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updatePreferences(
    updates: Partial<UserPreference>
  ): Promise<boolean> {
    if (!user?.id) return false

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update(updates as any)
        .eq('user_id', user.id)

      if (error) throw error

      setPreferences((prev) => (prev ? { ...prev, ...updates } : null))
      return true
    } catch (error) {
      console.error('Error updating preferences:', error)
      return false
    }
  }

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences,
  }
}
```

#### components/settings/ThemeSelector.tsx

```typescript
'use client'

import { usePreferences } from '@/hooks/usePreferences'
import { themePalettes } from '@/lib/themes/palettes'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'

export function ThemeSelector() {
  const { preferences, updatePreferences } = usePreferences()

  async function selectTheme(palette: string) {
    await updatePreferences({ themePalette: palette })
    // Apply theme to document
    applyTheme(palette)
  }

  function applyTheme(palette: string) {
    const theme = themePalettes[palette as keyof typeof themePalettes]
    if (!theme) return

    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-secondary', theme.secondary)
    root.style.setProperty('--color-accent', theme.accent)
    root.style.setProperty('--color-background', theme.background)
    root.style.setProperty('--color-foreground', theme.foreground)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Palette de couleurs</h3>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(themePalettes).map(([key, theme]) => (
          <Card
            key={key}
            className={`p-4 cursor-pointer transition-all ${
              preferences?.themePalette === key
                ? 'ring-2 ring-primary'
                : 'hover:bg-muted'
            }`}
            onClick={() => selectTheme(key)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{theme.name}</p>
                <div className="flex gap-2 mt-2">
                  {[theme.primary, theme.secondary, theme.accent].map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              {preferences?.themePalette === key && (
                <Check className="w-6 h-6 text-primary" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

#### components/settings/AccessibilitySettings.tsx

```typescript
'use client'

import { usePreferences } from '@/hooks/usePreferences'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'

export function AccessibilitySettings() {
  const { preferences, updatePreferences } = usePreferences()

  if (!preferences) return null

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Accessibilité</h3>

      <div className="space-y-4">
        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode">Mode sombre</Label>
          <Switch
            id="dark-mode"
            checked={preferences.darkMode}
            onCheckedChange={(checked) => {
              updatePreferences({ darkMode: checked })
              document.documentElement.classList.toggle('dark', checked)
            }}
          />
        </div>

        {/* Font Scale */}
        <div className="space-y-2">
          <Label>Taille du texte: {preferences.fontScale}%</Label>
          <Slider
            value={[preferences.fontScale]}
            min={80}
            max={120}
            step={10}
            onValueChange={([value]) => {
              updatePreferences({ fontScale: value })
              document.documentElement.style.fontSize = `${value}%`
            }}
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <Label htmlFor="reduced-motion">Réduire les animations</Label>
          <Switch
            id="reduced-motion"
            checked={preferences.reducedMotion}
            onCheckedChange={(checked) => {
              updatePreferences({ reducedMotion: checked })
            }}
          />
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <Label htmlFor="high-contrast">Contraste élevé</Label>
          <Switch
            id="high-contrast"
            checked={preferences.highContrast}
            onCheckedChange={(checked) => {
              updatePreferences({ highContrast: checked })
            }}
          />
        </div>
      </div>
    </div>
  )
}
```

### 5. Export & Backup System

#### lib/export/pdf.ts - PDF Export

```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function exportToPDF(coupleData: any): Promise<Blob> {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.text('Notre Calendrier 💕', 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 105, 30, { align: 'center' })

  let yPos = 50

  // Events
  if (coupleData.events?.length > 0) {
    doc.setFontSize(16)
    doc.text('Événements', 20, yPos)
    yPos += 10

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Titre', 'Type']],
      body: coupleData.events.map((e: any) => [
        e.eventDate,
        e.title,
        e.eventType
      ]),
    })

    yPos = (doc as any).lastAutoTable.finalY + 20
  }

  // Memories
  if (coupleData.memories?.length > 0) {
    doc.setFontSize(16)
    doc.text('Souvenirs', 20, yPos)
    yPos += 10

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Titre', 'Description']],
      body: coupleData.memories.map((m: any) => [
        m.memoryDate,
        m.title,
        m.description || ''
      ]),
    })

    yPos = (doc as any).lastAutoTable.finalY + 20
  }

  // Bucket List
  if (coupleData.bucketList?.length > 0) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(16)
    doc.text('Bucket List', 20, yPos)
    yPos += 10

    autoTable(doc, {
      startY: yPos,
      head: [['Titre', 'Statut', 'Catégorie']],
      body: coupleData.bucketList.map((b: any) => [
        b.title,
        b.status,
        b.category
      ]),
    })
  }

  return doc.output('blob')
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

#### lib/export/json.ts - JSON Export

```typescript
export async function exportToJSON(coupleData: any): Promise<Blob> {
  const jsonString = JSON.stringify(coupleData, null, 2)
  return new Blob([jsonString], { type: 'application/json' })
}

export function downloadJSON(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

#### lib/export/ics.ts - ICS Calendar Export

```typescript
import { createEvents } from 'ics'

export async function exportToICS(events: any[]): Promise<Blob> {
  const icsEvents = events.map(event => ({
    title: event.title,
    description: event.description || '',
    start: parseDate(event.eventDate, event.eventTime),
    duration: { hours: 1 },
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
  }))

  const { error, value } = createEvents(icsEvents)

  if (error) {
    throw new Error('Failed to create ICS file')
  }

  return new Blob([value as string], { type: 'text/calendar' })
}

function parseDate(dateStr: string, timeStr?: string): [number, number, number, number, number] {
  const date = new Date(dateStr)
  const time = timeStr ? timeStr.split(':') : ['12', '00']

  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    parseInt(time[0]),
    parseInt(time[1])
  ]
}

export function downloadICS(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

#### lib/export/zip.ts - ZIP Archive Export

```typescript
import JSZip from 'jszip'

export async function exportToZIP(
  coupleData: any,
  includePhotos: boolean = false
): Promise<Blob> {
  const zip = new JSZip()

  // Add JSON data
  const jsonData = JSON.stringify(coupleData, null, 2)
  zip.file('data.json', jsonData)

  // Add README
  const readme = `
Notre Calendrier 💕 - Export complet

Exporté le: ${new Date().toLocaleString('fr-FR')}

Contenu:
- data.json: Toutes vos données au format JSON
${includePhotos ? '- photos/: Toutes vos photos de souvenirs' : ''}

Pour restaurer vos données, utilisez la fonction "Importer" dans les paramètres.
  `
  zip.file('README.txt', readme.trim())

  // Add photos if requested
  if (includePhotos && coupleData.memories) {
    const photosFolder = zip.folder('photos')

    for (const memory of coupleData.memories) {
      if (memory.imageUrl) {
        try {
          const response = await fetch(memory.imageUrl)
          const blob = await response.blob()
          const filename = `${memory.id}.${blob.type.split('/')[1]}`
          photosFolder?.file(filename, blob)
        } catch (error) {
          console.error(`Failed to fetch photo: ${memory.imageUrl}`, error)
        }
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' })
}

export function downloadZIP(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

#### app/(app)/settings/export/page.tsx - Export Page

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Download, FileJson, FileText, Calendar, Archive } from 'lucide-react'
import { useCouple } from '@/hooks/useCouple'
import { exportToPDF, downloadPDF } from '@/lib/export/pdf'
import { exportToJSON, downloadJSON } from '@/lib/export/json'
import { exportToICS, downloadICS } from '@/lib/export/ics'
import { exportToZIP, downloadZIP } from '@/lib/export/zip'

export default function ExportPage() {
  const { couple } = useCouple()
  const [includePhotos, setIncludePhotos] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleExport(format: 'pdf' | 'json' | 'ics' | 'zip') {
    if (!couple?.id) return

    setLoading(format)

    try {
      // Fetch all couple data
      const response = await fetch(`/api/export?coupleId=${couple.id}`)
      const data = await response.json()

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `calendrier-${timestamp}`

      switch (format) {
        case 'pdf': {
          const blob = await exportToPDF(data)
          downloadPDF(blob, `${filename}.pdf`)
          break
        }
        case 'json': {
          const blob = await exportToJSON(data)
          downloadJSON(blob, `${filename}.json`)
          break
        }
        case 'ics': {
          const blob = await exportToICS(data.events)
          downloadICS(blob, `${filename}.ics`)
          break
        }
        case 'zip': {
          const blob = await exportToZIP(data, includePhotos)
          downloadZIP(blob, `${filename}.zip`)
          break
        }
      }

      // Save backup record
      await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          includesPhotos: format === 'zip' && includePhotos
        })
      })
    } catch (error) {
      console.error(`Export ${format} failed:`, error)
      alert(`Échec de l'export ${format}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Exporter vos données</h1>
          <p className="text-muted-foreground">
            Téléchargez une copie de toutes vos données
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Format PDF</CardTitle>
            <CardDescription>
              Document lisible avec tous vos événements, souvenirs et bucket list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleExport('pdf')}
              disabled={!!loading}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              {loading === 'pdf' ? 'Export en cours...' : 'Exporter en PDF'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Format JSON</CardTitle>
            <CardDescription>
              Format technique pour sauvegarder ou transférer vos données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleExport('json')}
              disabled={!!loading}
              variant="outline"
              className="w-full"
            >
              <FileJson className="w-4 h-4 mr-2" />
              {loading === 'json' ? 'Export en cours...' : 'Exporter en JSON'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Format ICS (Calendrier)</CardTitle>
            <CardDescription>
              Importez vos événements dans Google Calendar, Apple Calendar, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleExport('ics')}
              disabled={!!loading}
              variant="outline"
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {loading === 'ics' ? 'Export en cours...' : 'Exporter le calendrier'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Archive ZIP complète</CardTitle>
            <CardDescription>
              Backup complet avec toutes vos données et optionnellement vos photos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-photos">Inclure les photos</Label>
              <Switch
                id="include-photos"
                checked={includePhotos}
                onCheckedChange={setIncludePhotos}
              />
            </div>
            <Button
              onClick={() => handleExport('zip')}
              disabled={!!loading}
              variant="default"
              className="w-full"
            >
              <Archive className="w-4 h-4 mr-2" />
              {loading === 'zip' ? 'Export en cours...' : 'Créer l\'archive ZIP'}
            </Button>
            {includePhotos && (
              <p className="text-sm text-muted-foreground">
                ⚠️ L'export avec photos peut prendre plusieurs minutes
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### 6. Dependencies to Install

```bash
# Charts
bun add recharts

# PDF Generation
bun add jspdf jspdf-autotable
bun add -D @types/jspdf

# ICS Calendar
bun add ics

# ZIP Archive
bun add jszip
bun add -D @types/jszip

# Push Notifications
bun add web-push
bun add -D @types/web-push
```

### 7. Environment Variables

Add to `.env.local`:

```env
# VAPID Keys for Push Notifications (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_vapid_key
VAPID_PRIVATE_KEY=your_private_vapid_key

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### 8. Database Functions

Create `lib/db/phase5-functions.sql`:

```sql
-- Function: get_couple_stats
-- Returns comprehensive statistics for a couple
CREATE OR REPLACE FUNCTION get_couple_stats(p_couple_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalEvents', (
      SELECT COUNT(*) FROM events WHERE couple_id = p_couple_id
    ),
    'upcomingEvents', (
      SELECT COUNT(*) FROM events
      WHERE couple_id = p_couple_id AND event_date >= CURRENT_DATE
    ),
    'eventsThisMonth', (
      SELECT COUNT(*) FROM events
      WHERE couple_id = p_couple_id
      AND EXTRACT(MONTH FROM event_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM event_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    'totalMemories', (
      SELECT COUNT(*) FROM memories WHERE couple_id = p_couple_id
    ),
    'memoriesThisYear', (
      SELECT COUNT(*) FROM memories
      WHERE couple_id = p_couple_id
      AND EXTRACT(YEAR FROM memory_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    'totalMessages', (
      SELECT COUNT(*) FROM love_notes WHERE couple_id = p_couple_id
    ),
    'messagesThisWeek', (
      SELECT COUNT(*) FROM love_notes
      WHERE couple_id = p_couple_id
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'totalBucketItems', (
      SELECT COUNT(*) FROM bucket_list_items WHERE couple_id = p_couple_id
    ),
    'completedBucketItems', (
      SELECT COUNT(*) FROM bucket_list_items
      WHERE couple_id = p_couple_id AND status = 'done'
    ),
    'bucketCompletionRate', (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE status = 'done')::FLOAT / COUNT(*) * 100)
      END
      FROM bucket_list_items WHERE couple_id = p_couple_id
    ),
    'totalRituals', (
      SELECT COUNT(*) FROM rituals WHERE couple_id = p_couple_id
    ),
    'activeStreaks', (
      SELECT COUNT(*) FROM rituals
      WHERE couple_id = p_couple_id AND streak_current > 0
    ),
    'longestStreak', (
      SELECT COALESCE(MAX(streak_longest), 0)
      FROM rituals WHERE couple_id = p_couple_id
    ),
    'moodLogsThisMonth', (
      SELECT COUNT(*) FROM daily_moods
      WHERE couple_id = p_couple_id
      AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    'totalGratitudes', (
      SELECT COUNT(*) FROM gratitude_entries WHERE couple_id = p_couple_id
    ),
    'sharedGratitudesCount', (
      SELECT COUNT(*) FROM shared_gratitude WHERE couple_id = p_couple_id
    ),
    'totalQuestionsAnswered', (
      SELECT COUNT(*) FROM question_answers WHERE couple_id = p_couple_id
    ),
    'daysSinceCreation', (
      SELECT EXTRACT(DAY FROM (CURRENT_DATE - created_at::DATE))
      FROM couples WHERE id = p_couple_id
    )
  ) INTO v_stats;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Trigger: update_onboarding_progress
-- Automatically update onboarding progress when users complete actions
CREATE OR REPLACE FUNCTION update_onboarding_milestone()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine which milestone to update based on table
  IF TG_TABLE_NAME = 'events' THEN
    UPDATE onboarding_progress
    SET has_created_first_event = TRUE
    WHERE user_id = NEW.created_by;

  ELSIF TG_TABLE_NAME = 'memories' THEN
    UPDATE onboarding_progress
    SET has_uploaded_first_memory = TRUE
    WHERE user_id = NEW.created_by;

  ELSIF TG_TABLE_NAME = 'love_notes' THEN
    UPDATE onboarding_progress
    SET has_sent_first_message = TRUE
    WHERE user_id = NEW.from_user_id;

  ELSIF TG_TABLE_NAME = 'bucket_list_items' THEN
    UPDATE onboarding_progress
    SET has_added_bucket_list_item = TRUE
    WHERE user_id = NEW.created_by;

  ELSIF TG_TABLE_NAME = 'daily_moods' THEN
    UPDATE onboarding_progress
    SET has_logged_mood = TRUE
    WHERE user_id = NEW.user_id;

  ELSIF TG_TABLE_NAME = 'question_answers' THEN
    UPDATE onboarding_progress
    SET has_answered_question = TRUE
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER tr_event_milestone
AFTER INSERT ON events
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

CREATE TRIGGER tr_memory_milestone
AFTER INSERT ON memories
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

CREATE TRIGGER tr_message_milestone
AFTER INSERT ON love_notes
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

CREATE TRIGGER tr_bucket_milestone
AFTER INSERT ON bucket_list_items
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

CREATE TRIGGER tr_mood_milestone
AFTER INSERT ON daily_moods
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

CREATE TRIGGER tr_question_milestone
AFTER INSERT ON question_answers
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();
```

### 9. RLS Policies for Phase 5 Tables

Add to `lib/db/rls-policies.sql`:

```sql
-- ============================================
-- Phase 5: RLS Policies for New Tables
-- ============================================

-- Table: user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table: backups
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can view their backups"
  ON backups FOR SELECT
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create backups"
  ON backups FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Table: onboarding_progress
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding progress"
  ON onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress"
  ON onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress"
  ON onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table: feature_flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view enabled feature flags"
  ON feature_flags FOR SELECT
  USING (is_enabled = TRUE);

-- Admin users can manage feature flags (requires custom claim)
CREATE POLICY "Admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

-- Table: analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all analytics (requires custom claim)
CREATE POLICY "Admins can view all analytics"
  ON analytics_events FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );
```

### 10. Performance Optimizations

#### Database Indexes
Add to `lib/db/indexes.sql`:

```sql
-- Performance indexes for Phase 5

-- Analytics queries
CREATE INDEX idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_couple_created ON analytics_events(couple_id, created_at DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);

-- Backup queries
CREATE INDEX idx_backups_couple_created ON backups(couple_id, created_at DESC);

-- Preferences queries (already has unique index on user_id)

-- Statistics aggregations
CREATE INDEX idx_events_couple_date ON events(couple_id, event_date);
CREATE INDEX idx_memories_couple_date ON memories(couple_id, memory_date);
CREATE INDEX idx_moods_couple_date ON daily_moods(couple_id, date);
CREATE INDEX idx_gratitude_couple_date ON gratitude_entries(couple_id, date);
```

#### Image Optimization
Create `lib/utils/image-optimization.ts`:

```typescript
export function getOptimizedImageUrl(url: string, width: number, quality: number = 80): string {
  // For Cloudflare R2 with Image Resizing
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  if (!url.startsWith(baseUrl || '')) return url

  const path = url.replace(baseUrl || '', '')
  return `${baseUrl}/cdn-cgi/image/width=${width},quality=${quality},format=auto${path}`
}

export async function compressImage(file: File, maxWidth: number = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            } else {
              reject(new Error('Compression failed'))
            }
          },
          'image/jpeg',
          0.85
        )
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}
```

### 11. Testing Checklist

After implementation:

#### PWA
- [ ] Manifest loads correctly
- [ ] Service worker registers successfully
- [ ] App installs on mobile devices
- [ ] Offline page displays when no connection
- [ ] App shortcuts work
- [ ] "Add to Home Screen" prompt appears

#### Push Notifications
- [ ] Notification permission request works
- [ ] Subscription saved to database
- [ ] Push notifications received
- [ ] Notification click opens correct page
- [ ] Unsubscribe works correctly
- [ ] All 10 notification types tested

#### Statistics
- [ ] All metrics calculate correctly
- [ ] Charts render properly
- [ ] Data updates in real-time
- [ ] Performance acceptable with large datasets

#### Personalization
- [ ] All 5 theme palettes apply correctly
- [ ] Dark mode toggles properly
- [ ] Font scale adjusts text size
- [ ] Reduced motion disables animations
- [ ] High contrast mode works
- [ ] Settings persist across sessions

#### Export/Backup
- [ ] PDF export includes all data
- [ ] JSON export complete and valid
- [ ] ICS import works in external calendars
- [ ] ZIP with photos completes successfully
- [ ] Backup history saved to database
- [ ] Large exports don't timeout

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Touch targets at least 44x44px
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Error messages clear

### 12. Deployment Steps

1. **Install dependencies**:
   ```bash
   bun add recharts jspdf jspdf-autotable ics jszip web-push
   bun add -D @types/jspdf @types/jszip @types/web-push
   ```

2. **Generate VAPID keys**:
   ```bash
   npx web-push generate-vapid-keys
   ```
   Add to `.env.local`

3. **Create PWA assets**:
   - Generate icons in all sizes (72x72 to 512x512)
   - Create screenshots for app stores
   - Add manifest.json
   - Create service worker
   - Create offline.html

4. **Push database changes**:
   ```bash
   bun db:push
   ```

5. **Apply SQL functions**:
   - Run `phase5-functions.sql` in Supabase SQL Editor
   - Run `indexes.sql` for performance
   - Verify all triggers created

6. **Apply RLS policies**:
   - Run Phase 5 policies in SQL Editor
   - Test policies with different users

7. **Test locally**:
   - Test PWA installation
   - Test push notifications
   - Export/import data
   - Switch themes
   - Generate statistics

8. **Deploy to production**:
   - Build: `npm run build`
   - Deploy to Vercel/hosting
   - Verify environment variables
   - Test in production

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Recharts Docs](https://recharts.org/)
- [jsPDF Docs](https://github.com/parallax/jsPDF)
- [JSZip Docs](https://stuk.github.io/jszip/)

---

**Good luck with Phase 5! ✨**

This is the final polish that will make your app production-ready!
