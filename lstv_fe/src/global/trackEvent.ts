import mixpanel from 'mixpanel-browser';
import { userEventsService } from '../rest-api/services/userEventService';

export type EventType = 'vendor_inquiry' | 'vendor_contact' | 'venue_contact' | 'vendor_engagement' | 'pop_up';

export interface EventPayload {
  event_label?: string;
  event_category?: 'business_engagement';
  sent_from_page_type?: 'video_page' | 'business_page';
  sent_from_button_location?:
    | 'body'
    | 'sidebar'
    | 'mobile_sticky_bar'
    | 'video_page_body'
    | 'wedding_team_card'
    | 'popup';
  /**
   * Reserved for use by GA.
   */
  non_interaction?: never;
  [custom_key: string]: any;
}

export type AnalyticsTarget = 'lstv_be' | 'ga' | 'mixpanel';

export interface TrackingOptions {
  includeTargets?: Iterable<AnalyticsTarget>;
  excludeTargets?: Iterable<AnalyticsTarget>;
}

// If this is required in the future, we can have this function return a Promise instead of `void`
// to notify that event has been sent.
interface EventHandler {
  (eventType: EventType, payload?: EventPayload, options?: TrackingOptions): void;
}

const deployedInProduction = window.location.hostname === 'lovestoriestv.com';

const { postUserEvent } = userEventsService();

let initializedGa = false;

const handlerGa: EventHandler = (eventType, payload) => {
  if (!deployedInProduction) {
    return;
  }

  if (!initializedGa) {
    // GA requires this config in order for custom values to be sent. Apparently
    // this will not be required if/when we upgrade from GA Universal to GA 4.
    // For now custom properties not listed here will not be sent to GA.
    gtag('config', 'UA-66927174-1', {
      custom_map: {
        dimension1: 'sent_from_button_location',
        dimension2: 'sent_from_page_type',
      },
    });
    initializedGa = true;
  }

  gtag('event', eventType, { non_interaction: true, ...payload });
};

const handleMixpanel: EventHandler = (eventType, payload) => {
  if (!deployedInProduction) {
    return;
  }

  mixpanel.track(eventType, payload);
};

const handleBackend: EventHandler = (eventType, payload) => {
  postUserEvent({
    domain: 'user_action',
    event: eventType,
    severity: 'info',
    data: payload,
  });
};

const handlers: { [key in AnalyticsTarget]: EventHandler } = {
  ga: handlerGa,
  mixpanel: handleMixpanel,
  lstv_be: handleBackend,
};

/**
 * Sends an event to analytics platforms. By default the event is sent to
 * all platforms, but platforms can be whitelisted or blacklisted via options.
 *
 * Currently we always send `non_interaction = true` to GA. If necessary, an
 * option to control this behavior can be added to `TrackingOptions` in the future.
 */
export const trackEvent: EventHandler = (eventType, payload, options) => {
  const targetsBeforeExcluded = [...(options?.includeTargets ?? (Object.keys(handlers) as AnalyticsTarget[]))];
  const excludeTargetsSet = new Set(options?.excludeTargets ?? []);
  targetsBeforeExcluded
    .filter((target) => !excludeTargetsSet.has(target))
    .forEach((target) => handlers[target](eventType, payload, options));
};
