# Car Image Upload API — Backend Reference

## Endpoint

    POST /api/cars

## Description
Creates a new car entry. Accepts car data and an optional image file. The image is uploaded and stored on the backend; the response includes the image URL/path.

## Request Format
- Content-Type: multipart/form-data
- Fields:
  - `brand` (string, required)
  - `model` (string, required)
  - `year` (integer, required)
  - `vin` (string, required)
  - `mileage` (integer, required)
  - `price` (integer, optional)
  - `nickname` (string, optional)
  - `image` (file, optional) — Car image (jpg, png, etc.)

## Example cURL Request
```bash
curl -X POST http://localhost:8080/api/cars \
  -F "brand=Toyota" \
  -F "model=Camry" \
  -F "year=2020" \
  -F "vin=123456789ABCDEFG" \
  -F "mileage=50000" \
  -F "price=1500000" \
  -F "nickname=Мой любимчик" \
  -F "image=@/path/to/car.jpg"
```

## Expected Response
- Content-Type: application/json
- Status: 201 Created (on success)

```json
{
  "id": 42,
  "brand": "Toyota",
  "model": "Camry",
  "year": 2020,
  "vin": "123456789ABCDEFG",
  "mileage": 50000,
  "price": 1500000,
  "nickname": "Мой любимчик",
  "imageUrl": "/uploads/cars/42.jpg"  // Path or URL to the stored image
}
```

## Notes for Backend Implementation
- The backend should accept multipart/form-data and handle file uploads securely.
- Store the image in a dedicated directory (e.g., `/uploads/cars/`).
- Return the image URL/path in the response as `imageUrl`.
- Validate file type and size (e.g., max 5MB, only images).
- If no image is uploaded, `imageUrl` can be null or a default image path.
- Ensure proper error handling for invalid data or upload failures. 

Image Upload Flow
1. Frontend: Image Upload Flow
What Needs to Change
When the user adds a car and selects an image, the image file should be sent to the backend (in production mode).
In demo mode, you can keep the preview logic as is (no actual storage).
The backend should return a URL or identifier for the stored image, which you then save as part of the car object.
2. Frontend Implementation Plan
A. Update addCarToBackend to handle image upload:
If CONFIG.useBackend is true, send a FormData object (with image and car data) to the backend.
If false, keep demo logic as is.
B. Update the backend API endpoint:
The backend should accept multipart/form-data, save the image, and return the image URL/path.
3. Frontend Code Changes
A. Update addCarToBackend
Detect if an image file is present.
If in backend mode, send a FormData object.
If in demo mode, ignore the image (or optionally store a DataURL in localStorage for preview).
B. Update Car Data Structure
Store the image URL/path returned by the backend in the car object.
4. Backend API Contract (for your Java backend)
Endpoint: POST /api/cars
Accepts: multipart/form-data with fields for car data and an image file
Returns: JSON with car data, including an imageUrl or similar field