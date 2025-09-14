import requests
import json
import os

def test_plant_analysis():
    """Test the plant analysis API with image upload"""

    # Test image file
    image_path = "invasive.png"

    if not os.path.exists(image_path):
        print(f"❌ Test image not found: {image_path}")
        print("Please provide an image file to test with")
        return False

    base_url = "http://localhost:8000"

    print("Testing Plant Analysis API...")
    print("=" * 50)

    try:
        # Prepare the file and form data
        with open(image_path, 'rb') as image_file:
            files = {
                'image': (image_path, image_file, 'image/png')
            }
            data = {
                'region': 'North America'
            }

            print(f"Sending image: {image_path}")
            print(f"Region: {data['region']}")

            # Make POST request to analyze-plant endpoint
            response = requests.post(
                f"{base_url}/api/analyze-plant",
                files=files,
                data=data,
                timeout=60  # 60 second timeout for image processing
            )

        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")

        if response.status_code == 200:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
        else:
            print(f"Error Response: {response.text}")

        return response.status_code == 200

    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Could not connect to the server")
        print("   Make sure the server is running on localhost:8000")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Request took too long")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

def test_server_health():
    """Check if server is running"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"✅ Server is running (Status: {response.status_code})")
        return True
    except:
        print("❌ Server is not running or not accessible")
        return False

def test_direct_imager():
    """Test the Imager class directly"""
    try:
        from backend import Imager

        imager = Imager()
        image_path = "invasive.png"

        if not os.path.exists(image_path):
            print(f"❌ Test image not found: {image_path}")
            return False

        print("\nTesting Imager class directly...")
        result = imager.analyze_plant_image(image_path)
        print(f"Direct imager result: {result}")
        return True

    except Exception as e:
        print(f"❌ Direct imager test failed: {e}")
        return False

if __name__ == "__main__":
    print("Plant Imager Test Suite")
    print("=" * 60)

    # Check server health first
    if not test_server_health():
        print("\nPlease start the server first:")
        print("uvicorn main:app --reload --port 8000")
        exit(1)

    # Test direct imager class
    test_direct_imager()

    # Test API endpoint
    success = test_plant_analysis()

    if success:
        print("\n✅ Testing completed successfully!")
    else:
        print("\n❌ Testing failed!")