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
            print(f"✅ Response received successfully!")
            print(f"Response JSON keys: {list(result.keys())}")

            # Print structured data
            if result.get("specieIdentified"):
                print(f"🌿 Plant Identified: {result['specieIdentified']}")
            if result.get("nativeRegion"):
                print(f"🌍 Native Region: {result['nativeRegion']}")
            print(f"⚠️  Is Invasive: {result.get('invasiveOrNot', 'Unknown')}")
            if result.get("invasiveEffects"):
                print(f"💥 Invasive Effects: {result['invasiveEffects'][:150]}...")
            if result.get("nativeAlternatives"):
                print(f"🌱 Native Alternatives: {len(result['nativeAlternatives'])} suggestions")
                for i, alt in enumerate(result['nativeAlternatives'][:2], 1):
                    print(f"   {i}. {alt.get('commonName', 'Unknown')} ({alt.get('scientificName', 'Unknown')})")
            if result.get("removeInstructions"):
                print(f"🗑️  Remove Instructions: {result['removeInstructions'][:150]}...")

            print(f"\nFull Response JSON:")
            print(json.dumps(result, indent=2))
        else:
            print(f"❌ Error Response: {response.text}")

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

def test_different_regions():
    """Test the API with different regions"""
    base_url = "http://localhost:8000"
    image_path = "invasive.png"

    if not os.path.exists(image_path):
        print(f"❌ Test image not found: {image_path}")
        return False

    regions = ["North America", "Europe", "Asia", "Australia"]
    print("\nTesting different regions...")
    print("=" * 40)

    for region in regions:
        try:
            with open(image_path, 'rb') as image_file:
                files = {
                    'image': (image_path, image_file, 'image/png')
                }
                data = {
                    'region': region
                }

                print(f"\n📍 Testing region: {region}")
                response = requests.post(
                    f"{base_url}/api/analyze-plant",
                    files=files,
                    data=data,
                    timeout=60
                )

                if response.status_code == 200:
                    result = response.json()
                    print(f"   ✅ Success - Is invasive: {result.get('invasiveOrNot', 'Unknown')}")
                else:
                    print(f"   ❌ Failed: {response.status_code}")

        except Exception as e:
            print(f"   ❌ Error testing {region}: {e}")

    return True

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
    """Test the Imager class directly with two-call approach"""
    try:
        from app.backend import Imager

        imager = Imager()
        image_path = "invasive.png"

        if not os.path.exists(image_path):
            print(f"❌ Test image not found: {image_path}")
            return False

        print("\nTesting Imager class directly...")

        # Test the new two-call approach
        result = imager.analyze_plant_image(image_path)
        print(f"✅ Two-call approach successful!")
        print(f"Result type: {type(result)}")
        print(f"Result keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")

        # Print key fields
        if isinstance(result, dict):
            if result.get("specieIdentified"):
                print(f"🌿 Plant Identified: {result['specieIdentified']}")
            if result.get("nativeRegion"):
                print(f"🌍 Native Region: {result['nativeRegion']}")
            print(f"⚠️  Is Invasive: {result.get('invasiveOrNot', 'Unknown')}")
            if result.get("invasiveEffects"):
                print(f"💥 Invasive Effects: {result['invasiveEffects'][:100]}...")
            if result.get("nativeAlternatives"):
                print(f"🌱 Native Alternatives: {len(result['nativeAlternatives'])} suggestions")
                for i, alt in enumerate(result['nativeAlternatives'][:2], 1):
                    print(f"   {i}. {alt.get('commonName', 'Unknown')}")
            if result.get("removeInstructions"):
                print(f"🗑️  Remove Instructions: {result['removeInstructions'][:100]}...")
        else:
            print(f"❌ Expected dict, got {type(result)}")

        return True

    except Exception as e:
        print(f"❌ Direct imager test failed: {e}")
        import traceback
        traceback.print_exc()
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

    # Test different regions
    if success:
        test_different_regions()

    if success:
        print("\n✅ Testing completed successfully!")
    else:
        print("\n❌ Testing failed!")