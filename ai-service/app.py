from flask import Flask, request, jsonify
import os
import uuid
import tempfile
import boto3
from botocore.client import Config
from gradio_client import Client, handle_file
import requests
from pathlib import Path

app = Flask(__name__)

# Environment variables
HF_SPACE_NAME = os.environ.get('HF_SPACE_NAME', 'Kwai-Kolors/Kolors-Virtual-Try-On')
HF_TOKEN = os.environ.get('HF_TOKEN')  # Optional for public spaces

# MinIO configuration using boto3 (S3-compatible)
s3_client = boto3.client(
    's3',
    endpoint_url=f"http://{os.environ.get('MINIO_ENDPOINT', 'minio')}:{os.environ.get('MINIO_PORT', '9000')}",
    aws_access_key_id=os.environ.get('MINIO_ACCESS_KEY', 'minioadmin'),
    aws_secret_access_key=os.environ.get('MINIO_SECRET_KEY', 'minioadmin'),
    config=Config(signature_version='s3v4'),
    region_name='us-east-1'
)

# MinIO bucket names
BUCKET_BODY_IMAGES = os.environ.get('MINIO_BUCKET_BODY_IMAGES', 'body-images')
BUCKET_GARMENTS = os.environ.get('MINIO_BUCKET_GARMENTS', 'garments')
BUCKET_TRYON_RESULTS = os.environ.get('MINIO_BUCKET_TRYON_RESULTS', 'try-on-results')

# Initialize Gradio client (lazy initialization)
gradio_client = None

def get_gradio_client():
    """Get or create Gradio client instance"""
    global gradio_client
    if gradio_client is None:
        try:
            if HF_TOKEN:
                gradio_client = Client(HF_SPACE_NAME, hf_token=HF_TOKEN)
            else:
                gradio_client = Client(HF_SPACE_NAME)
            print(f"Connected to Hugging Face Space: {HF_SPACE_NAME}")
        except Exception as e:
            print(f"Error connecting to Hugging Face Space: {str(e)}")
            raise
    return gradio_client

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'AI Try-On Service',
        'hf_space': HF_SPACE_NAME
    }), 200

@app.route('/try-on', methods=['POST'])
def try_on():
    """
    Virtual try-on endpoint using Hugging Face Space.
    
    Request body:
    {
        "session_id": "uuid",
        "body_image_key": "minio-key-for-body-image",
        "garment_image_keys": ["minio-key-for-garment"]
    }
    
    Response:
    {
        "session_id": "uuid",
        "result_image_key": "minio-key-for-result"
    }
    """
    temp_files = []
    
    try:
        data = request.json
        session_id = data.get('session_id')
        body_image_key = data.get('body_image_key')
        garment_image_keys = data.get('garment_image_keys', [])
        
        if not session_id or not body_image_key or not garment_image_keys:
            return jsonify({
                'error': 'Missing required fields: session_id, body_image_key, garment_image_keys'
            }), 400
        
        # Extract keys from URLs if they contain full URLs
        body_key = body_image_key.split('/')[-1] if '/' in body_image_key else body_image_key
        garment_key = garment_image_keys[0].split('/')[-1] if '/' in garment_image_keys[0] else garment_image_keys[0]
        
        print(f"Processing try-on for session {session_id}")
        print(f"Body image key: {body_key}")
        print(f"Garment image key: {garment_key}")
        
        # Download body image from MinIO
        body_image_path = tempfile.mktemp(suffix='.jpg')
        temp_files.append(body_image_path)
        print(f"Downloading body image from bucket: {BUCKET_BODY_IMAGES}")
        s3_client.download_file(BUCKET_BODY_IMAGES, body_key, body_image_path)
        
        # Download garment image from MinIO
        garment_image_path = tempfile.mktemp(suffix='.jpg')
        temp_files.append(garment_image_path)
        print(f"Downloading garment image from bucket: {BUCKET_GARMENTS}")
        s3_client.download_file(BUCKET_GARMENTS, garment_key, garment_image_path)
        
        # Get Gradio client and call the Hugging Face Space
        client = get_gradio_client()
        print(f"Calling Hugging Face Space: {HF_SPACE_NAME}")
        
        # Call the Space with the images
        # The Kolors-Virtual-Try-On space expects: person image, garment image, and seed
        result = client.predict(
            person_img=handle_file(body_image_path),
            garment_img=handle_file(garment_image_path),
            seed=42,
            api_name="/tryon"
        )
        
        print(f"Received result from Hugging Face Space")
        
        # The result is typically a tuple/list with the output image path/URL
        # Handle different result formats
        result_image_path = None
        if isinstance(result, tuple) or isinstance(result, list):
            result_image_path = result[0] if len(result) > 0 else None
        else:
            result_image_path = result
        
        if not result_image_path:
            raise Exception("No result image returned from Hugging Face Space")
        
        print(f"Result image path: {result_image_path}")
        
        # Download the result if it's a URL
        final_result_path = tempfile.mktemp(suffix='.png')
        temp_files.append(final_result_path)
        
        if result_image_path.startswith('http://') or result_image_path.startswith('https://'):
            response = requests.get(result_image_path)
            response.raise_for_status()
            with open(final_result_path, 'wb') as f:
                f.write(response.content)
        else:
            # It's a local file path from Gradio
            import shutil
            shutil.copy(result_image_path, final_result_path)
        
        # Upload result to MinIO
        result_key = f"{session_id}.png"
        print(f"Uploading result to MinIO bucket: {BUCKET_TRYON_RESULTS}, key: {result_key}")
        s3_client.upload_file(
            final_result_path,
            BUCKET_TRYON_RESULTS,
            result_key,
            ExtraArgs={'ContentType': 'image/png'}
        )
        
        print(f"Try-on completed successfully for session {session_id}")
        
        return jsonify({
            'session_id': session_id,
            'result_image_key': result_key
        }), 200
        
    except Exception as e:
        print(f"Error processing try-on: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e)
        }), 500
    
    finally:
        # Clean up temporary files
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except Exception as e:
                print(f"Error cleaning up temp file {temp_file}: {str(e)}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
