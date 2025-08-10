#!/usr/bin/env python3
"""
Test script for enhanced HCM platform features
"""

import requests
import json
import time

def test_enhanced_features():
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Enhanced HCM Platform Features")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{base_url}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health: {data['status']}")
            print(f"✅ Database: {data['services']['database']}")
            print(f"✅ Cache: {data['services']['cache']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: HCM Pages with Features
    print("\n2. Testing HCM Pages API with Features...")
    try:
        response = requests.get(f"{base_url}/api/hcm-pages")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data['status']}")
            print(f"✅ Pages returned: {len(data['data'])}")
            
            # Check if features are included
            for page in data['data']:
                print(f"   📄 {page['name']}: {len(page.get('features', []))} features")
                
                # Test individual features endpoint
                if page.get('features'):
                    print(f"      🔍 Testing features endpoint for page {page['id']}...")
                    features_response = requests.get(f"{base_url}/api/hcm-pages/{page['id']}/features")
                    if features_response.status_code == 200:
                        features_data = features_response.json()
                        print(f"      ✅ Features endpoint working: {len(features_data['data'])} features returned")
                    else:
                        print(f"      ❌ Features endpoint failed: {features_response.status_code}")
        else:
            print(f"❌ HCM pages API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ HCM pages API error: {e}")
        return False
    
    # Test 3: Homepage
    print("\n3. Testing Homepage...")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200 and "Oracle HCM Analysis Platform" in response.text:
            print("✅ Homepage loads correctly")
        else:
            print("❌ Homepage issue")
            return False
    except Exception as e:
        print(f"❌ Homepage error: {e}")
        return False
    
    # Test 4: HCM Pages Dashboard
    print("\n4. Testing HCM Pages Dashboard...")
    try:
        response = requests.get(f"{base_url}/hcm-pages")
        if response.status_code == 200 and "HCM Pages Analysis" in response.text:
            print("✅ Dashboard loads correctly")
        else:
            print("❌ Dashboard issue")
            return False
    except Exception as e:
        print(f"❌ Dashboard error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 ENHANCED FEATURES TEST: ALL PASSED!")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    # Wait for app to start
    print("⏳ Waiting for Flask app to start...")
    time.sleep(3)
    
    success = test_enhanced_features()
    if not success:
        print("\n❌ Some tests failed. Check the Flask app logs.")
        exit(1)