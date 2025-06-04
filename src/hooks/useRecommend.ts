
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFakePropertiesForHook, addFakePropertyForHook } from '@/services/api';
import type { Property } from '@/types';
import { useToast } from './use-toast';
import { PLACEHOLDER_HINTS } from '@/lib/constants';
import axios from 'axios';

// Type for the data passed to the addProperty mutation
// Ensure this reflects the new field names for Property where appropriate
export type NewPropertyData = Omit<Property, 'id' | 'image' | 'dataAiHint' | 'longitude' | 'latitude' | 'sale_month' | 'sale_year' | 'price'> & {
  price: number; // Price is required from form
  imageFile: FileList;
};


export function useRecommend() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { 
    data: properties = [], 
    isLoading: isLoadingProperties, 
    error: fetchPropertiesError 
  } = useQuery<Property[], Error>({
    queryKey: ['fakeProperties'],
    queryFn: fetchFakePropertiesForHook,
  });

  const addPropertyMutation = useMutation<Property, Error, NewPropertyData>({
    mutationFn: async (newPropertyData) => {
      const imageFile = newPropertyData.imageFile[0];
      const imageAsDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      let longitude: number | undefined = undefined;
      let latitude: number | undefined = undefined;

      const trimmedAddress = newPropertyData.fullAddress.trim();
      let processedAddress = trimmedAddress;
      if (trimmedAddress.length >= 5 && !trimmedAddress.toLowerCase().includes('london')) {
        processedAddress += ', London';
      }

      if (trimmedAddress.length >= 5) {
        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(processedAddress)}&countrycodes=gb&limit=1`);
          if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            longitude = parseFloat(lon);
            latitude = parseFloat(lat);
          } else {
             console.warn("Geocoding failed for address:", newPropertyData.fullAddress, "- Coordinates will be undefined.");
          }
        } catch (error) {
          console.error("Geocoding error during property upload:", error);
        }
      }
      
      const currentDate = new Date();
      const sale_month = currentDate.getMonth() + 1;
      const sale_year = currentDate.getFullYear();

      const propertyToSave: Omit<Property, 'id'> & { 
        image: string; 
      } = {
        name: newPropertyData.name,
        fullAddress: newPropertyData.fullAddress,
        price: newPropertyData.price,
        propertyType: newPropertyData.propertyType,
        bedrooms: newPropertyData.bedrooms,
        bathrooms: newPropertyData.bathrooms,
        livingRooms: newPropertyData.livingRooms,
        floorAreaSqM: newPropertyData.floorAreaSqM,
        currentEnergyRating: newPropertyData.currentEnergyRating,
        tenure: newPropertyData.tenure,
        outcode: newPropertyData.outcode,
        description: newPropertyData.description,
        image: imageAsDataUrl,
        dataAiHint: PLACEHOLDER_HINTS.uploadedProperty,
        longitude,
        latitude,
        sale_month,
        sale_year,
      };
      return addFakePropertyForHook(propertyToSave);
    },
    onSuccess: (newProperty) => {
      queryClient.setQueryData<Property[]>(['fakeProperties'], (oldProperties = []) => {
        return [newProperty, ...oldProperties];
      });
      toast({
        title: "Property Listed",
        description: `The property "${newProperty.name}" has been successfully listed.`,
      });
    },
    onError: (error) => {
      console.error('Failed to add property:', error);
      toast({
        title: "Listing Failed",
        description: "Could not list the property at this time. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    properties,
    isLoadingProperties,
    fetchPropertiesError,
    addProperty: addPropertyMutation.mutateAsync,
    isAddingProperty: addPropertyMutation.isPending,
    addPropertyError: addPropertyMutation.error,
  };
}
