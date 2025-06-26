let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;
const loadCallbacks: Array<() => void> = [];
const errorCallbacks: Array<(error: Error) => void> = [];

declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

export async function loadGoogleMaps(
  maxRetries = 3,
  retryDelay = 1000
): Promise<void> {
  if (
    isLoaded &&
    window.google?.maps?.places &&
    window.google?.maps?.geometry
  ) {
    return Promise.resolve();
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = new Promise<void>(async (resolve, reject) => {
    let retries = 0;

    const attemptLoad = async () => {
      try {
        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com"]'
        );
        if (existingScript) {
          const checkLoaded = () => {
            if (window.google?.maps?.places && window.google?.maps?.geometry) {
              isLoaded = true;
              isLoading = false;
              loadCallbacks.forEach((callback) => callback());
              loadCallbacks.length = 0;
              resolve();
            } else {
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
          return;
        }

        // Corrected import path to point to lib/actions/google-maps.ts
        const { getGoogleMapsApiKey } = await import("./actions/google-maps");
        const apiKey = await getGoogleMapsApiKey();
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;
        script.async = true;

        script.onload = () => {
          console.log("Google Maps script loaded successfully");
          const checkReady = () => {
            if (window.google?.maps?.places && window.google?.maps?.geometry) {
              console.log("Google Maps API fully initialized");
              isLoaded = true;
              isLoading = false;
              loadCallbacks.forEach((callback) => callback());
              loadCallbacks.length = 0;
              resolve();
            } else {
              console.log("Waiting for Google Maps API to initialize...");
              setTimeout(checkReady, 50);
            }
          };
          checkReady();
        };

        script.onerror = () => {
          if (retries < maxRetries) {
            console.warn(
              `Google Maps script load failed, retrying (${
                retries + 1
              }/${maxRetries})...`
            );
            retries++;
            setTimeout(attemptLoad, retryDelay);
          } else {
            const error = new Error(
              "Failed to load Google Maps script after retries"
            );
            console.error("Google Maps script loading failed:", error);
            isLoading = false;
            loadPromise = null;
            errorCallbacks.forEach((callback) => callback(error));
            errorCallbacks.length = 0;
            reject(error);
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        if (retries < maxRetries) {
          console.warn(
            `Google Maps initialization failed, retrying (${
              retries + 1
            }/${maxRetries})...`
          );
          retries++;
          setTimeout(attemptLoad, retryDelay);
        } else {
          isLoading = false;
          loadPromise = null;
          const err =
            error instanceof Error
              ? error
              : new Error("Failed to initialize Google Maps");
          console.error("Error initializing Google Maps loader:", err);
          errorCallbacks.forEach((callback) => callback(err));
          errorCallbacks.length = 0;
          reject(err);
        }
      }
    };

    attemptLoad();
  });

  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return (
    isLoaded && window.google?.maps?.places && window.google?.maps?.geometry
  );
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
