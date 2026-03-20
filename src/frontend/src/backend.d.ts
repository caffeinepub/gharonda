import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Property {
    id: bigint;
    status: PropertyStatus;
    title: string;
    propertyType: PropertyType;
    bedrooms: bigint;
    createdAt: bigint;
    description: string;
    imageIds: Array<ExternalBlob>;
    areaSqFt: bigint;
    sellerId: Principal;
    bathrooms: bigint;
    price: bigint;
    location: string;
}
export interface Message {
    id: bigint;
    content: string;
    propertyId: bigint;
    isRead: boolean;
    receiverId: Principal;
    timestamp: bigint;
    senderId: Principal;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum PropertyStatus {
    sold = "sold",
    available = "available"
}
export enum PropertyType {
    commercial = "commercial",
    villa = "villa",
    plot = "plot",
    apartment = "apartment"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProperty(property: Property): Promise<bigint>;
    deleteProperty(id: bigint): Promise<void>;
    filterProperties(location: string | null, propertyType: PropertyType | null, minBedrooms: bigint | null, maxPrice: bigint | null): Promise<Array<Property>>;
    getAllProperties(): Promise<Array<Property>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(propertyId: bigint, otherParty: Principal): Promise<Array<Message>>;
    getPropertiesByLocation(location: string): Promise<Array<Property>>;
    getPropertiesBySeller(sellerId: Principal): Promise<Array<Property>>;
    getPropertiesByType(propertyType: PropertyType): Promise<Array<Property>>;
    getUserConversations(): Promise<Array<[bigint, Principal, Principal]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markMessageAsRead(messageId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(propertyId: bigint, receiverId: Principal, content: string): Promise<bigint>;
    updateProperty(id: bigint, property: Property): Promise<void>;
}
