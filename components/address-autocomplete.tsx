"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader } from "lucide-react";
import { loadGoogleMaps, isGoogleMapsLoaded } from "@/lib/google-maps-loader";

// Extend the global Window interface to include google
declare global {
  interface Window {
    google: any;
  }
}

interface PlaceDetails {
  placeId: string;
  address: string;
  coordinates: { lat: number; lng: number };
  formattedAddress: string;
}

interface AddressAutocompleteProps {
  label: string;
  placeholder: string;
  name: string;
  required?: boolean;
  onPlaceSelected: (place: PlaceDetails | null) => void;
  defaultValue?: string;
  className?: string;
}

export function AddressAutocomplete({
  label,
  placeholder,
  name,
  required = false,
  onPlaceSelected,
  defaultValue = "",
  className = "",
}: AddressAutocompleteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstance = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAutocomplete = async () => {
      try {
        // Use centralized Google Maps loader
        await loadGoogleMaps();
        if (!isMounted) return;

        // Initialize autocomplete after Google Maps is loaded
        initAutocomplete();
      } catch (err) {
        console.error("Error initializing autocomplete:", err);
        if (isMounted) {
          setError("Failed to initialize address search");
          setIsLoading(false);
        }
      }
    };

    const initAutocomplete = () => {
      if (!autocompleteRef.current || autocompleteInstance.current) return;

      try {
        // Verify Google Maps is loaded
        if (!isGoogleMapsLoaded()) {
          throw new Error("Google Maps not loaded");
        }

        // Create autocomplete instance with new Places API
        const autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteRef.current,
          {
            componentRestrictions: { country: ["de", "at", "ch"] }, // Restrict to Germany, Austria, Switzerland
            fields: ["place_id", "formatted_address", "name", "geometry"],
            types: ["establishment", "geocode"], // Allow both places and addresses
          }
        );

        autocompleteInstance.current = autocomplete;

        // Listen for place selection
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          if (!place.place_id || !place.geometry) {
            console.warn("No place details available for input:", place.name);
            onPlaceSelected(null);
            return;
          }

          const placeDetails: PlaceDetails = {
            placeId: place.place_id,
            address: place.name || place.formatted_address || "",
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
            formattedAddress: place.formatted_address || "",
          };

          setInputValue(place.formatted_address || place.name || "");
          onPlaceSelected(placeDetails);
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error creating autocomplete:", err);
        setError("Failed to initialize address search");
        setIsLoading(false);
      }
    };

    initializeAutocomplete();

    return () => {
      isMounted = false;
      if (autocompleteInstance.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteInstance.current);
      }
    };
  }, [onPlaceSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // If input is cleared, notify parent
    if (!value.trim()) {
      onPlaceSelected(null);
    }
  };

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label htmlFor={name}>{label}</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id={name}
            name={name}
            placeholder={placeholder}
            className="pl-9"
            required={required}
            disabled
            value={inputValue}
            onChange={handleInputChange}
          />
        </div>
        <p className="text-xs text-amber-600">
          Address search unavailable. Please enter the address manually.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={autocompleteRef}
          id={name}
          name={name}
          placeholder={placeholder}
          className="pl-9"
          required={required}
          value={inputValue}
          onChange={handleInputChange}
          autoComplete="off"
        />
        {isLoading && (
          <Loader className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {isLoading && (
        <p className="text-xs text-muted-foreground">Initializing address search...</p>
      )}
    </div>
  );
}
