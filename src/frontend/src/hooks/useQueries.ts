import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Property, PropertyType, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useAllProperties() {
  const { actor, isFetching } = useActor();
  return useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProperties();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterProperties(
  location: string | null,
  propertyType: PropertyType | null,
  minBedrooms: bigint | null,
  maxPrice: bigint | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Property[]>({
    queryKey: [
      "properties",
      "filter",
      location,
      propertyType,
      String(minBedrooms),
      String(maxPrice),
    ],
    queryFn: async () => {
      if (!actor) return [];
      return actor.filterProperties(
        location,
        propertyType,
        minBedrooms,
        maxPrice,
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePropertiesBySeller(sellerId: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Property[]>({
    queryKey: ["properties", "seller", sellerId?.toString()],
    queryFn: async () => {
      if (!actor || !sellerId) return [];
      return actor.getPropertiesBySeller(sellerId);
    },
    enabled: !!actor && !isFetching && !!sellerId,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useCreateProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (property: Property) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProperty(property as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      property,
    }: { id: bigint; property: Property }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProperty(id, property as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeleteProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUserConversations() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[bigint, Principal, Principal]>>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserConversations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useConversation(
  propertyId: bigint | undefined,
  otherParty: Principal | undefined,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["conversation", String(propertyId), otherParty?.toString()],
    queryFn: async () => {
      if (!actor || !propertyId || !otherParty) return [];
      return actor.getConversation(propertyId, otherParty);
    },
    enabled: !!actor && !isFetching && !!propertyId && !!otherParty,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      propertyId,
      receiverId,
      content,
    }: { propertyId: bigint; receiverId: Principal; content: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(propertyId, receiverId, content);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", String(vars.propertyId)],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useGetUserProfile(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}
