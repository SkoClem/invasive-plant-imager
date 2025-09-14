import requests
import json
import time

def test_api():
    """Test the FastAPI chat endpoint"""

    # Test data
    test_messages = [
        "hello",
        "What is 2+2?",
        "Tell me about invasive plants"
    ]

    base_url = "http://localhost:8000"

    print("Testing FastAPI Chat API...")
    print("=" * 50)

    for i, message in enumerate(test_messages, 1):
        print(f"\nTest {i}: Sending message - '{message}'")

        try:
            # Make POST request to chat endpoint
            response = requests.post(
                f"{base_url}/api/chat",
                headers={"Content-Type": "application/json"},
                json={"message": message},
                timeout=30  # 30 second timeout
            )

            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")

            if response.status_code == 200:
                result = response.json()
                print(f"Response: {json.dumps(result, indent=2)}")
            else:
                print(f"Error Response: {response.text}")

        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Could not connect to the server")
            print("   Make sure the server is running on localhost:8000")
            return False
        except requests.exceptions.Timeout:
            print("❌ Timeout Error: Request took too long")
        except requests.exceptions.RequestException as e:
            print(f"❌ Request Error: {e}")
        except json.JSONDecodeError:
            print("❌ JSON Error: Could not parse response")

        print("-" * 50)

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

if __name__ == "__main__":
    # Check server health first
    if not test_server_health():
        print("\nPlease start the server first:")
        print("uvicorn main:app --reload --port 8000")
        exit(1)

    # Run the tests
    success = test_api()

    if success:
        print("\n✅ Testing completed!")
    else:
        print("\n❌ Testing failed!")