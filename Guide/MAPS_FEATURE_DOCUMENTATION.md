# Map-Based Service Provider Search Feature

## Overview

This feature implements Google Maps integration to allow users to visually search for and discover service providers on an interactive map. Users can view service locations, search by proximity, and find services near their current location.

## Features

### 🗺️ Interactive Map View
- **Google Maps Integration**: Full Google Maps JavaScript API implementation
- **Service Markers**: Visual markers showing service provider locations
- **Info Windows**: Detailed service information in clickable popups
- **User Location**: Shows user's current location with GPS integration
- **Map Controls**: Pan, zoom, and navigation controls

### 📍 Location-Based Search
- **Nearby Search**: Find services within specified radius (5km, 10km, 25km, 50km)
- **Bounds Search**: Load services visible in current map viewport
- **GPS Location**: Automatic user location detection and centering
- **Address Geocoding**: Convert addresses to coordinates automatically

### 🎯 Service Discovery
- **Visual Markers**: Distinct markers for each service provider
- **Service Details**: Click markers to view service information
- **Price Display**: Indian Rupee (₹) formatted pricing
- **Category Filtering**: Filter services by category and subcategory
- **Direct Navigation**: Click to view full service details

### 📱 User Experience
- **Multiple View Modes**: List view, Map view, or Both simultaneously
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Services update as you move the map
- **Loading States**: Proper loading indicators and error handling

## Technical Implementation

### Backend Components

#### 1. Service Model Updates
```java
@Entity
@Table(name = "services")
public class Service {
    // ... existing fields
    
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude") 
    private Double longitude;
    
    // ... getters and setters
}
```

#### 2. Repository Queries
```java
// Find all services with coordinates
@Query("SELECT s FROM Service s WHERE s.latitude IS NOT NULL AND s.longitude IS NOT NULL AND s.isActive = true")
List<Service> findAllWithCoordinates();

// Find services within map bounds
@Query("SELECT s FROM Service s WHERE " +
       "s.latitude BETWEEN :minLat AND :maxLat AND " +
       "s.longitude BETWEEN :minLng AND :maxLng AND " +
       "s.isActive = true")
List<Service> findServicesInBounds(@Param("minLat") Double minLat, ...);

// Find services within radius using Haversine formula
@Query(value = "SELECT *, " +
       "(6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
       "cos(radians(longitude) - radians(:lng)) + sin(radians(:lat)) * " +
       "sin(radians(latitude)))) AS distance " +
       "FROM services " +
       "WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_active = true " +
       "HAVING distance <= :radiusKm " +
       "ORDER BY distance",
       nativeQuery = true)
List<Service> findServicesWithinRadius(@Param("lat") Double lat, ...);
```

#### 3. REST API Endpoints
```java
@GetMapping("/map")
public ResponseEntity<List<Service>> getAllServicesForMap()

@GetMapping("/map/bounds")  
public ResponseEntity<List<Service>> getServicesInBounds(
    @RequestParam Double minLat, @RequestParam Double maxLat,
    @RequestParam Double minLng, @RequestParam Double maxLng)

@GetMapping("/map/nearby")
public ResponseEntity<List<Service>> getServicesNearby(
    @RequestParam Double lat, @RequestParam Double lng,
    @RequestParam(defaultValue = "10") Double radiusKm)

@PatchMapping("/{id}/location")
public ResponseEntity<Service> updateServiceLocation(
    @PathVariable Long id, @RequestBody Map<String, Object> locationData)
```

### Frontend Components

#### 1. Google Maps Service (`googleMapsService.js`)
- **Map Initialization**: Loads Google Maps API and creates map instance
- **Marker Management**: Adds, removes, and updates service markers
- **User Location**: GPS location detection and display
- **Geocoding**: Address to coordinates conversion
- **Places Search**: Google Places API integration

#### 2. MapView Component (`MapView.js`)
- **Map Container**: React component wrapper for Google Maps
- **Service Display**: Shows services as interactive markers
- **Loading States**: Handles map loading and error states
- **User Controls**: Location centering and view controls

#### 3. LocationSelector Component (`LocationSelector.js`)
- **Address Input**: Text input with geocoding search
- **Map Selection**: Click-to-select location on map
- **Current Location**: GPS-based location detection
- **Coordinate Display**: Shows selected coordinates

#### 4. ServicesWithMap Page (`ServicesWithMap.js`)
- **Unified Interface**: Combines list and map views
- **Filter Integration**: Search, category, and location filters
- **View Modes**: Toggle between list, map, and combined views
- **Nearby Search**: Location-based proximity search

### Database Schema

```sql
-- Services table with geographic coordinates
ALTER TABLE services 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Indexes for efficient geographic queries
CREATE INDEX idx_services_coordinates ON services(latitude, longitude);
CREATE INDEX idx_services_active_coordinates ON services(is_active, latitude, longitude);
```

## Setup Instructions

### 1. Google Maps API Configuration

1. **Get API Key**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API

2. **Environment Configuration**:
   ```bash
   # Create .env file in frontend directory
   REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
   REACT_APP_API_URL=http://localhost:8080/api
   ```

3. **API Key Restrictions** (Recommended):
   - Restrict to your domain(s)
   - Limit to required APIs only

### 2. Database Migration

Run the migration to add coordinate columns:
```sql
-- This will be executed automatically by Flyway/Liquibase
ALTER TABLE services 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;
```

### 3. Frontend Dependencies

Google Maps API loader is already included in `package.json`:
```json
{
  "dependencies": {
    "@googlemaps/js-api-loader": "^1.15.1"
  }
}
```

## Usage Guide

### For Service Providers

1. **Creating Services**:
   - Use the enhanced LocationSelector in CreateService form
   - Enter address or click on map to set location
   - Coordinates are automatically saved

2. **Updating Location**:
   - Edit service to change location
   - Use "Select on Map" for precise positioning

### For Customers

1. **Finding Services**:
   - Visit `/services-map` page
   - Toggle between List, Map, or Both views
   - Use "Find Nearby" for location-based search

2. **Map Navigation**:
   - Click markers to see service details
   - Use map controls to navigate
   - Filter by category, price, location

### API Usage

```javascript
// Get services for map display
const services = await apiService.getServicesForMap();

// Get services in specific area
const bounds = { minLat: 28.5, maxLat: 28.7, minLng: 77.1, maxLng: 77.3 };
const servicesInArea = await apiService.getServicesInBounds(bounds);

// Find nearby services
const nearbyServices = await apiService.getNearbyServices(28.6139, 77.2090, 10);
```

## Performance Considerations

### 1. Database Optimization
- **Spatial Indexing**: Indexes on latitude/longitude columns
- **Composite Indexes**: Combined indexes for active services with coordinates
- **Query Optimization**: Efficient bounds and radius queries

### 2. Frontend Optimization
- **Marker Clustering**: Groups nearby markers at low zoom levels
- **Lazy Loading**: Load services only when needed
- **Debounced Updates**: Prevent excessive API calls during map movement

### 3. Caching Strategy
- **Service Data**: Cache service information for map display
- **Geocoding Results**: Cache address to coordinate conversions
- **Map Tiles**: Browser caches map tiles automatically

## Error Handling

### 1. API Key Issues
- Clear error messages for missing/invalid API keys
- Graceful fallback to list view if maps fail
- Setup instructions in error messages

### 2. Location Permissions
- Handle denied geolocation permissions
- Fallback to manual location entry
- Clear user messaging about location benefits

### 3. Network Issues
- Retry logic for failed API calls
- Loading states during map operations
- Offline detection and messaging

## Security Considerations

### 1. API Key Security
- **Domain Restrictions**: Limit API key to your domains
- **API Restrictions**: Only enable required Google APIs
- **Environment Variables**: Never commit API keys to version control

### 2. Location Privacy
- **User Consent**: Ask permission before accessing location
- **Data Minimization**: Only store necessary location data
- **Privacy Settings**: Allow users to control location sharing

## Testing

### 1. Unit Tests
```javascript
// Test coordinate validation
describe('LocationSelector', () => {
  test('validates coordinate format', () => {
    // Test coordinate validation logic
  });
});
```

### 2. Integration Tests
```javascript
// Test map service integration
describe('GoogleMapsService', () => {
  test('initializes map correctly', async () => {
    // Test map initialization
  });
});
```

### 3. Manual Testing Checklist
- [ ] Map loads correctly with API key
- [ ] Service markers display properly
- [ ] Click markers show correct information
- [ ] Search filters work with map
- [ ] Location detection works
- [ ] Mobile responsiveness
- [ ] Error states display correctly

## Future Enhancements

### 1. Advanced Features
- **Route Planning**: Directions to service providers
- **Real-time Tracking**: Live location updates during service
- **Geofencing**: Notifications when entering service areas
- **Heatmaps**: Service density visualization

### 2. Performance Improvements
- **Marker Clustering**: Group nearby services at low zoom
- **Virtual Scrolling**: Handle large numbers of services
- **Progressive Loading**: Load services as needed

### 3. User Experience
- **Save Locations**: Bookmark favorite areas
- **Location History**: Remember searched locations
- **Offline Maps**: Cached map data for offline use

## Troubleshooting

### Common Issues

1. **Map Not Loading**
   - Check API key configuration
   - Verify enabled APIs in Google Console
   - Check browser console for errors

2. **No Service Markers**
   - Verify services have coordinates in database
   - Check API endpoint responses
   - Ensure services are active

3. **Location Detection Fails**
   - Check HTTPS requirement for geolocation
   - Verify user permissions
   - Test on different devices/browsers

### Debug Tools

```javascript
// Enable debug logging
localStorage.setItem('DEBUG_MAPS', 'true');

// Check service coordinates
console.log('Services with coordinates:', services.filter(s => s.latitude && s.longitude));

// Verify API responses
console.log('API Response:', response);
```

## Support

For issues and questions:
1. Check this documentation
2. Review browser console for errors
3. Verify Google Maps API configuration
4. Test with sample data
5. Contact development team

---

*This feature significantly enhances the user experience by providing visual, location-based service discovery. The implementation is scalable, performant, and follows modern web development best practices.*