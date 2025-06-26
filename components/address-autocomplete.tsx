"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader } from "lucide-react";

interface PlaceDetails {
  placeId: string;
  address: string;
  coordinates: { lat: number; lng: number };
  formattedAddress: string;
}

interface AutocompletePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const fetchSuggestions = async (value: string) => {
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/places-autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: value }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(data.predictions || []);
      setShowSuggestions(data.predictions && data.predictions.length > 0);
    } catch (err) {
      console.error("Error fetching autocomplete suggestions:", err);
      setError("Failed to fetch address suggestions");
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    // If input is cleared, notify parent
    if (!value.trim()) {
      onPlaceSelected(null);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: AutocompletePrediction) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      // Fetch place details using another API call if needed
      // For now, we'll pass a partial PlaceDetails and let the parent handle full details if needed
      const placeDetails: PlaceDetails = {
        placeId: suggestion.placeId,
        address: suggestion.mainText,
        coordinates: { lat: 0, lng: 0 }, // Placeholder, to be filled by parent if needed
        formattedAddress: suggestion.description,
      };
      onPlaceSelected(placeDetails);
    } catch (err) {
      console.error("Error handling suggestion selection:", err);
      setError("Failed to load place details");
    } finally {
      setIsLoading(false);
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
            value={inputValue}
            onChange={handleInputChange}
          />
        </div>
        <p className="text-xs text-amber-600">
          Address search temporarily unavailable. Please enter the address manually.
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
          ref={inputRef}
          id={name}
          name={name}
          placeholder={placeholder}
          className="pl-9"
          required={required}
          value={inputValue}
          onChange={handleInputChange}
          autoComplete="off"
          onFocus={() => {
            if (inputValue.trim()) {
              fetchSuggestions(inputValue);
            }
          }}
          onBlur={() => {
            // Delay hiding suggestions to allow click events to register
            setTimeout(() => setShowSuggestions(false), 200);
          }}
        />
        {isLoading && (
          <Loader className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.placeId}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="font-medium">{suggestion.mainText}</div>
              {suggestion.secondaryText && (
                <div className="text-xs text-gray-500">{suggestion.secondaryText}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
