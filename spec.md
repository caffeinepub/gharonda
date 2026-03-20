# Gharonda - Chandigarh Real Estate Platform

## Current State
Empty Motoko actor with default React frontend scaffold. No features implemented.

## Requested Changes (Diff)

### Add
- Property listings: create, view, search, and filter properties in Chandigarh (sectors, areas)
- Property details: title, description, price, location (sector/area), type (apartment, villa, plot, commercial), bedrooms, bathrooms, area (sq ft), images
- Buyer-seller messaging system: conversation threads per property between buyer and seller
- User roles: Sellers can post and manage their properties; Buyers can browse and message sellers
- Authorization/login system
- Image uploads for properties via blob-storage

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Use authorization component for login and role management (buyer/seller)
2. Use blob-storage for property images
3. Backend: CRUD for properties, messaging system (send/receive messages per property)
4. Frontend: Home page with property grid, property detail page, post property form, messaging inbox/conversation view
