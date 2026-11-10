import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Home } = await import('@/pages/Home/Home');
          return { Component: Home };
        },
      },
      {
        lazy: async () => {
          const { default: MainLayout } = await import('@/layouts/MainLayout');
          return { Component: MainLayout };
        },
        children: [
          {
            path: 'trips',
            lazy: async () => {
              const { default: MyTrips } = await import('@/pages/Trips/MyTrips');
              return { Component: MyTrips };
            },
          },
          {
            path: 'explore',
            lazy: async () => {
              const { default: SectionPage } = await import('@/pages/Sections/SectionPage');
              return { Component: SectionPage };
            },
          },
          {
            path: 'shared',
            lazy: async () => {
              const { default: SectionPage } = await import('@/pages/Sections/SectionPage');
              return { Component: SectionPage };
            },
          },
          {
            path: 'stats',
            lazy: async () => {
              const { default: SectionPage } = await import('@/pages/Sections/SectionPage');
              return { Component: SectionPage };
            },
          },
          {
            path: '*',
            lazy: async () => {
              const { default: SectionPage } = await import('@/pages/Sections/SectionPage');
              return { Component: SectionPage };
            },
          },
        ],
      },
      {
            path: 'trips/new',
            lazy: async () => {
              const { default: TripPlanForm } = await import('@/pages/Trips/TripPlanForm');
              return { Component: TripPlanForm };
            },
          },
          {
            path: 'trips/:planId/edit',
            lazy: async () => {
              const { default: TripPlanForm } = await import('@/pages/Trips/TripPlanForm');
              return { Component: TripPlanForm };
            },
          },
          {
            path: 'trips/:planId',
            lazy: async () => {
              const { default: TripDetails } = await import('@/pages/Trips/TripDetails');
              return { Component: TripDetails };
            },
          },
    ],
  },
]);
