#!/usr/bin/env python3
"""
Validate and download fonts from font-database.json
Checks all URLs, downloads fonts to local directories, and validates file formats.
"""

import json
import os
import sys
import requests
from pathlib import Path
from urllib.parse import urlparse
import time

# File signatures (magic numbers) for font formats
FILE_SIGNATURES = {
    'woff2': b'wOF2',
    'woff': b'wOFF',
    'ttf': [b'\x00\x01\x00\x00', b'true', b'typ1'],  # TrueType signatures
    'otf': [b'OTTO'],  # OpenType signature
}

def check_file_signature(file_path, expected_format):
    """Check if file has correct magic number/signature for its format."""
    try:
        with open(file_path, 'rb') as f:
            header = f.read(8)
            
        if expected_format == 'ttf':
            for sig in FILE_SIGNATURES['ttf']:
                if header.startswith(sig):
                    return True
            return False
        elif expected_format == 'otf':
            for sig in FILE_SIGNATURES['otf']:
                if header.startswith(sig):
                    return True
            return False
        elif expected_format == 'woff2':
            return header.startswith(FILE_SIGNATURES['woff2'])
        elif expected_format == 'woff':
            return header.startswith(FILE_SIGNATURES['woff'])
        else:
            return False
    except Exception as e:
        print(f"Error checking signature: {e}")
        return False

def download_font(url, dest_path, font_name, format_type):
    """Download a font file and validate its format."""
    result = {
        'url': url,
        'font': font_name,
        'format': format_type,
        'status': None,
        'message': None,
        'file_path': None
    }
    
    try:
        print(f"  Checking {format_type.upper()}: {url}")
        
        # Make request with timeout
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        
        if response.status_code == 404:
            result['status'] = 'NOT_FOUND'
            result['message'] = f"404 Not Found"
            print(f"    ❌ 404 Not Found")
            return result
        
        if response.status_code != 200:
            result['status'] = 'HTTP_ERROR'
            result['message'] = f"HTTP {response.status_code}"
            print(f"    ❌ HTTP {response.status_code}")
            return result
        
        # Create destination directory
        os.makedirs(dest_path, exist_ok=True)
        
        # Determine filename
        if url.endswith(('.ttf', '.otf', '.woff', '.woff2')):
            filename = os.path.basename(urlparse(url).path)
        else:
            filename = f"{font_name.replace(' ', '_')}.{format_type}"
        
        file_path = os.path.join(dest_path, filename)
        
        # Save file
        with open(file_path, 'wb') as f:
            f.write(response.content)
        
        # Validate file format
        if not check_file_signature(file_path, format_type):
            os.remove(file_path)  # Remove invalid file
            result['status'] = 'INVALID_FORMAT'
            result['message'] = f"File is not a valid {format_type.upper()} (wrong magic number)"
            print(f"    ❌ Invalid {format_type.upper()} format (wrong magic number)")
            return result
        
        file_size = os.path.getsize(file_path)
        result['status'] = 'SUCCESS'
        result['message'] = f"Downloaded successfully ({file_size:,} bytes)"
        result['file_path'] = file_path
        print(f"    ✅ Downloaded successfully ({file_size:,} bytes)")
        return result
        
    except requests.exceptions.Timeout:
        result['status'] = 'TIMEOUT'
        result['message'] = "Request timed out"
        print(f"    ❌ Timeout")
        return result
    except requests.exceptions.RequestException as e:
        result['status'] = 'REQUEST_ERROR'
        result['message'] = str(e)
        print(f"    ❌ Request error: {e}")
        return result
    except Exception as e:
        result['status'] = 'ERROR'
        result['message'] = str(e)
        print(f"    ❌ Error: {e}")
        return result

def main():
    # Load font database
    db_path = 'font-database.json'
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found")
        sys.exit(1)
    
    with open(db_path, 'r') as f:
        fonts = json.load(f)
    
    print(f"Loaded {len(fonts)} fonts from database\n")
    
    # Results tracking
    results = {
        'total_fonts': len(fonts),
        'embedded_fonts': 0,
        'successful_downloads': [],
        'not_found_404': [],
        'invalid_format': [],
        'other_errors': [],
        'skipped': []
    }
    
    # Process each font
    for font in fonts:
        if font['source'] != 'embedded':
            continue
            
        results['embedded_fonts'] += 1
        font_name = font['name']
        print(f"\n{font_name}:")
        
        # Create font directory
        safe_name = font_name.lower().replace(' ', '-').replace('/', '-')
        font_dir = os.path.join('fonts', safe_name)
        
        # Check each format
        for format_type, url_key in [('ttf', 'ttf'), ('otf', 'otf'), ('woff2', 'woff2')]:
            url = font.get(url_key)
            if not url:
                continue
                
            # Skip GitHub release zips and archives
            if url.endswith('.zip') or url.endswith('.tar.gz'):
                print(f"  Skipping {format_type.upper()}: Archive file (not direct font)")
                results['skipped'].append({
                    'font': font_name,
                    'url': url,
                    'reason': 'Archive file'
                })
                continue
            
            # Download and validate
            result = download_font(url, font_dir, font_name, format_type)
            
            if result['status'] == 'SUCCESS':
                results['successful_downloads'].append(result)
            elif result['status'] == 'NOT_FOUND':
                results['not_found_404'].append(result)
            elif result['status'] == 'INVALID_FORMAT':
                results['invalid_format'].append(result)
            else:
                results['other_errors'].append(result)
            
            # Small delay to be polite to servers
            time.sleep(0.5)
    
    # Print summary
    print("\n" + "="*60)
    print("VALIDATION SUMMARY")
    print("="*60)
    
    print(f"\nTotal fonts in database: {results['total_fonts']}")
    print(f"Embedded fonts to check: {results['embedded_fonts']}")
    
    if results['successful_downloads']:
        print(f"\n✅ Successfully downloaded: {len(results['successful_downloads'])}")
        for item in results['successful_downloads']:
            print(f"  - {item['font']} ({item['format']})")
    
    if results['not_found_404']:
        print(f"\n❌ 404 Not Found: {len(results['not_found_404'])}")
        for item in results['not_found_404']:
            print(f"  - {item['font']} ({item['format']}): {item['url']}")
    
    if results['invalid_format']:
        print(f"\n❌ Invalid file format: {len(results['invalid_format'])}")
        for item in results['invalid_format']:
            print(f"  - {item['font']} ({item['format']}): {item['message']}")
            print(f"    URL: {item['url']}")
    
    if results['other_errors']:
        print(f"\n⚠️ Other errors: {len(results['other_errors'])}")
        for item in results['other_errors']:
            print(f"  - {item['font']} ({item['format']}): {item['message']}")
    
    if results['skipped']:
        print(f"\n⏭️ Skipped: {len(results['skipped'])}")
        for item in results['skipped']:
            print(f"  - {item['font']}: {item['reason']}")
    
    # Write detailed report
    report_path = 'font_validation_report.json'
    with open(report_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nDetailed report saved to: {report_path}")

if __name__ == '__main__':
    main()