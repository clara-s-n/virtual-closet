# AI Service for Virtual Closet

This AI service provides virtual try-on functionality for the Virtual Closet application using Hugging Face Spaces.

## Implementation

This service integrates with a Hugging Face Space (default: [Kwai-Kolors/Kolors-Virtual-Try-On](https://huggingface.co/spaces/Kwai-Kolors/Kolors-Virtual-Try-On)) to perform AI-powered virtual try-on. The service:

1. Receives try-on requests from the backend
2. Downloads body and garment images from MinIO
3. Calls the Hugging Face Space via `gradio_client`
4. Uploads the result image back to MinIO
5. Returns the result image key

## Architecture

```
Backend → AI Service → Hugging Face Space → AI Service → MinIO → Backend
```

## Environment Variables

### Required Variables

- `PORT`: Service port (default: 5000)
- `MINIO_ENDPOINT`: MinIO server endpoint (default: minio)
- `MINIO_PORT`: MinIO server port (default: 9000)
- `MINIO_ACCESS_KEY`: MinIO access key (default: minioadmin)
- `MINIO_SECRET_KEY`: MinIO secret key (default: minioadmin)

### Optional Variables

- `MINIO_USE_SSL`: Use SSL for MinIO (default: false)
- `MINIO_BUCKET_BODY_IMAGES`: Bucket for body images (default: body-images)
- `MINIO_BUCKET_GARMENTS`: Bucket for garment images (default: garments)
- `MINIO_BUCKET_TRYON_RESULTS`: Bucket for try-on results (default: try-on-results)
- `HF_SPACE_NAME`: Hugging Face Space name (default: Kwai-Kolors/Kolors-Virtual-Try-On)
- `HF_TOKEN`: Hugging Face API token (optional, required for private/duplicated spaces)

## API Endpoints

### POST /try-on

Process a virtual try-on request.

**Request Body:**
```json
{
  "session_id": "uuid",
  "body_image_key": "minio-key-for-body-image",
  "garment_image_keys": ["minio-key-for-garment"]
}
```

**Response (Success):**
```json
{
  "session_id": "uuid",
  "result_image_key": "minio-key-for-result"
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "AI Try-On Service",
  "hf_space": "Kwai-Kolors/Kolors-Virtual-Try-On"
}
```

## Using a Different Hugging Face Space

To use a different virtual try-on model:

1. Find a compatible Hugging Face Space (must accept person image and garment image)
2. Set the `HF_SPACE_NAME` environment variable to the Space name (e.g., `username/space-name`)
3. If the Space is private or you've duplicated it, set `HF_TOKEN` to your Hugging Face API token
4. Update the `client.predict()` call in `app.py` to match the Space's API parameters

To view the API parameters for a Space:
- Visit the Space on Hugging Face
- Click "Use via API" to see the parameter names and expected format
- Or use `client.view_api()` in Python

### Example: Switching to IDM-VTON

If you want to use `yisol/IDM-VTON` instead:

1. Set `HF_SPACE_NAME=yisol/IDM-VTON`
2. Update the `client.predict()` call in `app.py`:

```python
result = client.predict(
    dict_image={"background": handle_file(body_image_path)},
    garm_img=handle_file(garment_image_path),
    garment_des="A garment",
    is_checked=True,
    is_checked_crop=False,
    denoise_steps=30,
    seed=42,
    api_name="/tryon"
)
```

## How the Integration Works

1. **Image Download**: The service downloads the body and garment images from MinIO using boto3 (S3-compatible client)
2. **Gradio Client**: Uses `gradio_client` to connect to the Hugging Face Space
3. **Inference**: Calls the Space's `/tryon` endpoint with the images and parameters
4. **Result Processing**: Downloads the result image (which may be a URL or local path)
5. **Upload**: Uploads the result to MinIO's try-on-results bucket
6. **Response**: Returns the MinIO key of the result image

## Dependencies

- `flask`: Web framework
- `gradio_client`: Client for Hugging Face Spaces
- `boto3`: AWS S3-compatible client (for MinIO)
- `requests`: HTTP library
- `pillow`: Image processing

## Performance Notes

- The try-on process can take 30-120 seconds depending on the Space's queue and processing time
- The backend has a 3-minute timeout for try-on requests
- For production use, consider:
  - Using a duplicated Space to avoid queue times
  - Implementing async processing with webhooks
  - Adding retry logic for transient failures

## Troubleshooting

### Common Issues

1. **"Space not found" error**: Verify `HF_SPACE_NAME` is correct
2. **Authentication errors**: If using a private Space, ensure `HF_TOKEN` is set
3. **Timeout errors**: The Space may be busy. Try again or duplicate the Space
4. **Parameter errors**: The Space's API may have changed. Use `client.view_api()` to see current parameters

### Debugging

Enable Flask debug mode:
```bash
export FLASK_DEBUG=true
```

This will provide detailed error messages and stack traces.
```
