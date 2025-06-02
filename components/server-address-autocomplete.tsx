"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader, Check } from "lucide-react";
import { getAutocompletePredictions, getPlaceDetails } from "@/lib/actions/places-autocomplete";
import type { AutocompletePrediction, PlaceDetails } from "@/lib/actions/places-autocomplete";

interface ServerAddressAutocompleteProps {
  label: string;
  placeholder: string;
  name: string;
  required?: boolean;
  onPlaceSelected: (place: PlaceDetails | null) => void;
  defaultValue?: string;
  className?: string;
}

export function ServerAddressAutocomplete({
  label,
  placeholder,
  name,
  required = false,
  onPlaceSelected,
  defaultValue = "",
  className = "",
}: ServerAddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [sessionToken] = useState(() => Math.random().toString(36).substring(7));
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle input changes with debouncing
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedPlace(null);
    onPlaceSelected(null);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (!value.trim()) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    // Debounce the API call
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await getAutocompletePredictions(value, sessionToken);
        setPredictions(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error("Error getting predictions:", error);
        setPredictions([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // Handle prediction selection
  const handlePredictionSelect = async (prediction: AutocompletePrediction) => {
    setInputValue(prediction.description);
    setShowDropdown(false);
    setPredictions([]);
    setIsLoading(true);

    try {
      const placeDetails = await getPlaceDetails(prediction.placeId, sessionToken);
      if (placeDetails) {
        setSelectedPlace(placeDetails);
        onPlaceSelected(placeDetails);
      }
    } catch (error) {
      console.error("Error getting place details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-2 relative ${className}`}>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          id={name}
          name={name}
          placeholder={placeholder}
          className="pl-9 pr-9"
          required={required}
          value={inputValue}
          onChange={handleInputChange}
          autoComplete="off"
        />
        {isLoading && (
          <Loader className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {selectedPlace && !isLoading && (
          <Check className="absolute right-3 top-3 h-4 w-4 text-green-600" />
        )}
      </div>

      {/* Dropdown with predictions */}
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.placeId}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              onClick={() => handlePredictionSelect(prediction)}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {prediction.mainText}
                  </div>
                  {prediction.secondaryText && (
                    <div className="text-sm text-gray-500 truncate">
                      {prediction.secondaryText}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Status messages */}
      {isLoading && inputValue.trim() && (
        <p className="text-xs text-muted-foreground">Searching for addresses...</p>
      )}
      
      {!isLoading && inputValue.trim() && predictions.length === 0 && showDropdown && (
        <p className="text-xs text-amber-600">
          No addresses found. Please try a different search term.
        </p>
      )}
    </div>
  );
}
