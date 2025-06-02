"use client";

import { getGoogleMapsApiKey } from "@/lib/actions/google-maps";

// Global state to track Google Maps loading
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

// Queue of callbacks waiting for Google Maps to load
const loadCallbacks: Array<() => void> = [];
const errorCallbacks: Array<(error: Error) => void> = [];

declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

export async function loadGoogleMaps(): Promise<void> {
  // If already loaded, resolve immediately
  if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Start loading
  isLoading = true;
  loadPromise = new Promise<void>(async (resolve, reject) => {
    try {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      
      if (existingScript) {
        // Script exists, wait for it to load
        const checkLoaded = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            isLoaded = true;
            isLoading = false;
            // Execute all pending callbacks
            loadCallbacks.forEach(callback => callback());
            loadCallbacks.length = 0;
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Get API key
      const apiKey = await getGoogleMapsApiKey();

      // Create and load script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;

      script.onload = () => {
        // Double-check that everything is loaded
        const checkReady = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            isLoaded = true;
            isLoading = false;
            // Execute all pending callbacks
            loadCallbacks.forEach(callback => callback());
            loadCallbacks.length = 0;
            resolve();
          } else {
            setTimeout(checkReady, 50);
          }
        };
        checkReady();
      };

      script.onerror = () => {
        const error = new Error("Failed to load Google Maps");
        isLoading = false;
        loadPromise = null;
        // Execute all pending error callbacks
        errorCallbacks.forEach(callback => callback(error));
        errorCallbacks.length = 0;
        reject(error);
      };

      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      loadPromise = null;
      const err = error instanceof Error ? error : new Error("Failed to initialize Google Maps");
      // Execute all pending error callbacks
      errorCallbacks.forEach(callback => callback(err));
      errorCallbacks.length = 0;
      reject(err);
    }
  });

  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded && window.google && window.google.maps && window.google.maps.places;
}

export function onGoogleMapsLoad(callback: () => void): void {
  if (isGoogleMapsLoaded()) {
    callback();
  } else {
    loadCallbacks.push(callback);
  }
}

export function onGoogleMapsError(callback: (error: Error) => void): void {
  errorCallbacks.push(callback);
}
